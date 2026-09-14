using Microsoft.EntityFrameworkCore;
using RetailCategoryInsights.Core.DTOs;
using RetailCategoryInsights.Core.Interfaces;
using RetailCategoryInsights.Infrastructure.Data;

namespace RetailCategoryInsights.Infrastructure.Services;

public class SalesQueryService : ISalesQueryService
{
    private readonly RetailDbContext _context;

    public SalesQueryService(RetailDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync()
    {
        return await _context.Categories
            .AsNoTracking()
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Code,
                c.Description,
                c.TargetMarginPct,
                c.Products.Count
            ))
            .ToListAsync();
    }

    public async Task<List<TopProductDto>> GetTopProductsByCategoryAsync(int categoryId, string range, int limit = 10)
    {
        int days = ParseRangeDays(range);
        var endDate = DateTime.UtcNow.Date;
        var startDate = endDate.AddDays(-days);

        // Previous period start date for WoW / Period-over-Period comparison
        var prevStartDate = startDate.AddDays(-days);

        // Calculate latest stock levels per product across stores
        var latestStockMap = await _context.Inventories
            .AsNoTracking()
            .Where(i => i.Product.CategoryId == categoryId)
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Stock = g.OrderByDescending(x => x.AsOfDate).First().StockQuantity })
            .ToDictionaryAsync(x => x.ProductId, x => x.Stock);

        // Fetch sales records in range for this category
        var salesData = await _context.DailySales
            .AsNoTracking()
            .Where(ds => ds.Product.CategoryId == categoryId && ds.SaleDate >= prevStartDate && ds.SaleDate <= endDate)
            .Select(ds => new
            {
                ds.ProductId,
                ds.SaleDate,
                ds.UnitsSold,
                ds.TotalRevenue,
                ds.TotalCost
            })
            .ToListAsync();

        var categoryProducts = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();

        var result = new List<TopProductDto>();

        foreach (var prod in categoryProducts)
        {
            var currentSales = salesData.Where(s => s.ProductId == prod.Id && s.SaleDate >= startDate && s.SaleDate <= endDate).ToList();
            var prevSales = salesData.Where(s => s.ProductId == prod.Id && s.SaleDate >= prevStartDate && s.SaleDate < startDate).ToList();

            decimal currentRevenue = currentSales.Sum(s => s.TotalRevenue);
            int currentUnits = currentSales.Sum(s => s.UnitsSold);
            decimal currentCost = currentSales.Sum(s => s.TotalCost);
            decimal previousRevenue = prevSales.Sum(s => s.TotalRevenue);

            decimal grossProfit = currentRevenue - currentCost;
            decimal grossMarginPct = currentRevenue > 0 ? (grossProfit / currentRevenue) * 100m : 0m;
            decimal wowGrowth = previousRevenue > 0
                ? ((currentRevenue - previousRevenue) / previousRevenue) * 100m
                : (currentRevenue > 0 ? 100m : 0m);

            int stock = latestStockMap.TryGetValue(prod.Id, out var s) ? s : 0;

            result.Add(new TopProductDto(
                prod.Id,
                prod.SKU,
                prod.Name,
                prod.Category.Name,
                currentUnits,
                Math.Round(currentRevenue, 2),
                Math.Round(currentCost, 2),
                Math.Round(grossProfit, 2),
                Math.Round(grossMarginPct, 2),
                Math.Round(previousRevenue, 2),
                Math.Round(wowGrowth, 2),
                stock
            ));
        }

        return result
            .OrderByDescending(x => x.TotalRevenue)
            .Take(limit)
            .ToList();
    }

    public async Task<SalesTrendDto> GetSalesTrendAsync(int? categoryId, string range)
    {
        int days = ParseRangeDays(range);
        var endDate = DateTime.UtcNow.Date;
        var startDate = endDate.AddDays(-days);
        var prevStartDate = startDate.AddDays(-days);

        string categoryName = "All Categories";
        if (categoryId.HasValue)
        {
            var cat = await _context.Categories.FindAsync(categoryId.Value);
            if (cat != null) categoryName = cat.Name;
        }

        var query = _context.DailySales.AsNoTracking();
        if (categoryId.HasValue)
        {
            query = query.Where(ds => ds.Product.CategoryId == categoryId.Value);
        }

        var salesRecords = await query
            .Where(ds => ds.SaleDate >= prevStartDate && ds.SaleDate <= endDate)
            .Select(ds => new
            {
                ds.SaleDate,
                ds.UnitsSold,
                ds.TotalRevenue,
                ds.TotalCost
            })
            .ToListAsync();

        var currentRecords = salesRecords.Where(r => r.SaleDate >= startDate && r.SaleDate <= endDate).ToList();
        var prevRecords = salesRecords.Where(r => r.SaleDate >= prevStartDate && r.SaleDate < startDate).ToList();

        var dailyPoints = currentRecords
            .GroupBy(r => r.SaleDate)
            .Select(g => new DailySalesTrendPoint(
                g.Key,
                g.Sum(x => x.TotalRevenue),
                g.Sum(x => x.UnitsSold),
                g.Sum(x => x.TotalRevenue - x.TotalCost)
            ))
            .OrderBy(dp => dp.Date)
            .ToList();

        decimal totalRevenue = currentRecords.Sum(r => r.TotalRevenue);
        int totalUnits = currentRecords.Sum(r => r.UnitsSold);
        decimal avgDailyRevenue = dailyPoints.Count > 0 ? totalRevenue / dailyPoints.Count : 0m;

        decimal prevTotalRevenue = prevRecords.Sum(r => r.TotalRevenue);
        decimal wowChangePct = prevTotalRevenue > 0
            ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100m
            : (totalRevenue > 0 ? 100m : 0m);

        return new SalesTrendDto(
            categoryId,
            categoryName,
            range,
            Math.Round(totalRevenue, 2),
            totalUnits,
            Math.Round(avgDailyRevenue, 2),
            Math.Round(wowChangePct, 2),
            dailyPoints
        );
    }

    private static int ParseRangeDays(string range) => range?.ToLower() switch
    {
        "7d" => 7,
        "30d" => 30,
        "90d" => 90,
        "180d" => 180,
        _ => 30
    };
}
