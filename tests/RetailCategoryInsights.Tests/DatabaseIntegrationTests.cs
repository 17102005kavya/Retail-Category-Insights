using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using RetailCategoryInsights.Infrastructure.Data;
using RetailCategoryInsights.Infrastructure.Services;
using Xunit;

namespace RetailCategoryInsights.Tests;

public class DatabaseIntegrationTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly RetailDbContext _context;

    public DatabaseIntegrationTests()
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
    public async Task RealDatabase_SeedingAndComplexSalesQuery_ExecutesSuccessfully()
    {
        // Act: Seed real database schema
        await DataSeeder.SeedAsync(_context);

        // Verify Data Seeding
        var categoryCount = await _context.Categories.CountAsync();
        var productCount = await _context.Products.CountAsync();
        var storeCount = await _context.Stores.CountAsync();
        var salesCount = await _context.DailySales.CountAsync();

        Assert.Equal(10, categoryCount);
        Assert.Equal(50, productCount);
        Assert.Equal(5, storeCount);
        Assert.True(salesCount > 1000, $"Expected > 1000 daily sales records, got {salesCount}");

        // Test Query Services against real SQLite DB engine
        var salesService = new SalesQueryService(_context);
        var topProducts = await salesService.GetTopProductsByCategoryAsync(1, "30d", limit: 5);
        Assert.NotEmpty(topProducts);
        Assert.True(topProducts[0].TotalRevenue > 0);

        var inventoryService = new InventoryQueryService(_context);
        var stockoutRisks = await inventoryService.GetStockoutRiskProductsAsync(limit: 10);
        Assert.NotEmpty(stockoutRisks);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
