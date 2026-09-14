using Microsoft.EntityFrameworkCore;
using RetailCategoryInsights.Core.DTOs;
using RetailCategoryInsights.Core.Interfaces;
using RetailCategoryInsights.Infrastructure.Data;

namespace RetailCategoryInsights.Infrastructure.Services;

public class InventoryQueryService : IInventoryQueryService
{
    private readonly RetailDbContext _context;

    public InventoryQueryService(RetailDbContext context)
    {
        _context = context;
    }

    public async Task<List<StockoutRiskDto>> GetStockoutRiskProductsAsync(int limit = 15)
    {
        var endDate = DateTime.UtcNow.Date;
        var velocityStartDate = endDate.AddDays(-7);

        // 1. Calculate 7-day sales velocity per (ProductId, StoreId)
        var salesVelocities = await _context.DailySales
            .AsNoTracking()
            .Where(ds => ds.SaleDate >= velocityStartDate && ds.SaleDate <= endDate)
            .GroupBy(ds => new { ds.ProductId, ds.StoreId })
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.StoreId,
                Total7DayUnits = g.Sum(x => x.UnitsSold)
            })
            .ToDictionaryAsync(x => (x.ProductId, x.StoreId), x => x.Total7DayUnits / 7.0);

        // 2. Fetch latest inventory snapshot for each (ProductId, StoreId)
        var latestInventories = await _context.Inventories
            .AsNoTracking()
            .Include(i => i.Product)
                .ThenInclude(p => p.Category)
            .Include(i => i.Store)
            .GroupBy(i => new { i.ProductId, i.StoreId })
            .Select(g => g.OrderByDescending(x => x.AsOfDate).First())
            .ToListAsync();

        var riskList = new List<StockoutRiskDto>();

        foreach (var inv in latestInventories)
        {
            double avgDailyVelocity = salesVelocities.TryGetValue((inv.ProductId, inv.StoreId), out var vel) && vel > 0 ? vel : 0.5;
            double daysOfSupply = inv.StockQuantity / avgDailyVelocity;

            // Risk condition criteria
            bool isStockout = inv.StockQuantity == 0;
            bool isLowSupply = daysOfSupply <= 5.0;
            bool isBelowReorder = inv.StockQuantity <= inv.Product.ReorderPoint;

            if (isStockout || isLowSupply || isBelowReorder)
            {
                string riskLevel = isStockout || daysOfSupply <= 2.0 ? "CRITICAL" :
                                   daysOfSupply <= 4.0 || inv.StockQuantity <= (inv.Product.ReorderPoint / 2) ? "HIGH" :
                                   "MEDIUM";

                riskList.Add(new StockoutRiskDto(
                    inv.ProductId,
                    inv.Product.SKU,
                    inv.Product.Name,
                    inv.Product.Category.Name,
                    inv.StoreId,
                    inv.Store.Name,
                    inv.StockQuantity,
                    inv.Product.ReorderPoint,
                    Math.Round(avgDailyVelocity, 2),
                    Math.Round(daysOfSupply, 1),
                    riskLevel,
                    inv.AsOfDate
                ));
            }
        }

        return riskList
            .OrderBy(r => r.EstimatedDaysOfSupply)
            .ThenBy(r => r.CurrentStock)
            .Take(limit)
            .ToList();
    }
}
