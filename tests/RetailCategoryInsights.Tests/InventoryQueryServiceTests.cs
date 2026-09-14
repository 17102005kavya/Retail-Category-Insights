using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using RetailCategoryInsights.Core.Entities;
using RetailCategoryInsights.Infrastructure.Data;
using RetailCategoryInsights.Infrastructure.Services;
using Xunit;

namespace RetailCategoryInsights.Tests;

public class InventoryQueryServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly RetailDbContext _context;

    public InventoryQueryServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<RetailDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new RetailDbContext(options);
        _context.Database.EnsureCreated();
    }

    [Fact]
    public async Task GetStockoutRiskProductsAsync_IdentifiesCriticalRiskWhenStockIsZero()
    {
        // Arrange
        var category = new Category { Id = 1, Name = "Grocery", Code = "GROC", TargetMarginPct = 20m };
        _context.Categories.Add(category);

        var product = new Product { Id = 10, CategoryId = 1, SKU = "GROC-10", Name = "Organic Olive Oil", UnitPrice = 20m, CostPrice = 12m, ReorderPoint = 30, TargetStockLevel = 100 };
        _context.Products.Add(product);

        var store = new Store { Id = 1, Name = "Flagship Store", Region = "North" };
        _context.Stores.Add(store);

        var today = DateTime.UtcNow.Date;
        // Zero stock inventory
        _context.Inventories.Add(new Inventory { Id = 1, ProductId = 10, StoreId = 1, AsOfDate = today, StockQuantity = 0, ReservedQuantity = 0, ReorderStatus = "Stockout" });

        // Add 7 day sales (14 units sold over 7 days => velocity = 2 units/day)
        for (int i = 0; i < 7; i++)
        {
            _context.DailySales.Add(new DailySale { Id = 100 + i, ProductId = 10, StoreId = 1, SaleDate = today.AddDays(-i), UnitsSold = 2, UnitPrice = 20m, TotalRevenue = 40m, TotalCost = 24m });
        }

        await _context.SaveChangesAsync();

        var service = new InventoryQueryService(_context);

        // Act
        var riskProducts = await service.GetStockoutRiskProductsAsync(10);

        // Assert
        Assert.Single(riskProducts);
        var item = riskProducts[0];
        Assert.Equal("Organic Olive Oil", item.ProductName);
        Assert.Equal(0, item.CurrentStock);
        Assert.Equal("CRITICAL", item.RiskLevel);
        Assert.Equal(2.0, item.AvgDailySalesVelocity);
        Assert.Equal(0.0, item.EstimatedDaysOfSupply);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
