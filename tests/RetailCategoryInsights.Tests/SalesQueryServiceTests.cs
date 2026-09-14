using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using RetailCategoryInsights.Core.Entities;
using RetailCategoryInsights.Infrastructure.Data;
using RetailCategoryInsights.Infrastructure.Services;
using Xunit;

namespace RetailCategoryInsights.Tests;

public class SalesQueryServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly RetailDbContext _context;

    public SalesQueryServiceTests()
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
    public async Task GetAllCategoriesAsync_ReturnsSeededCategories()
    {
        // Arrange
        _context.Categories.Add(new Category { Id = 1, Name = "Electronics", Code = "ELEC", TargetMarginPct = 25m });
        _context.Categories.Add(new Category { Id = 2, Name = "Apparel", Code = "FASH", TargetMarginPct = 40m });
        await _context.SaveChangesAsync();

        var service = new SalesQueryService(_context);

        // Act
        var categories = await service.GetAllCategoriesAsync();

        // Assert
        Assert.NotNull(categories);
        Assert.Equal(2, categories.Count);
        Assert.Contains(categories, c => c.Name == "Electronics");
    }

    [Fact]
    public async Task GetTopProductsByCategoryAsync_CalculatesMetricsAndWowGrowthCorrectly()
    {
        // Arrange
        var category = new Category { Id = 1, Name = "Electronics", Code = "ELEC", TargetMarginPct = 25m };
        _context.Categories.Add(category);

        var product = new Product { Id = 1, CategoryId = 1, SKU = "ELEC-1", Name = "Laptop Pro", UnitPrice = 1000m, CostPrice = 700m, ReorderPoint = 5, TargetStockLevel = 20 };
        _context.Products.Add(product);

        var store = new Store { Id = 1, Name = "Store 1", Region = "North" };
        _context.Stores.Add(store);

        var today = DateTime.UtcNow.Date;
        // Current 30d period sale
        _context.DailySales.Add(new DailySale { Id = 1, ProductId = 1, StoreId = 1, SaleDate = today.AddDays(-5), UnitsSold = 10, UnitPrice = 1000m, TotalRevenue = 10000m, TotalCost = 7000m });
        // Previous 30d period sale (35 days ago)
        _context.DailySales.Add(new DailySale { Id = 2, ProductId = 1, StoreId = 1, SaleDate = today.AddDays(-35), UnitsSold = 5, UnitPrice = 1000m, TotalRevenue = 5000m, TotalCost = 3500m });

        await _context.SaveChangesAsync();

        var service = new SalesQueryService(_context);

        // Act
        var topProducts = await service.GetTopProductsByCategoryAsync(1, "30d", 10);

        // Assert
        Assert.Single(topProducts);
        var p = topProducts[0];
        Assert.Equal("Laptop Pro", p.ProductName);
        Assert.Equal(10000m, p.TotalRevenue);
        Assert.Equal(3000m, p.GrossProfit);
        Assert.Equal(30.0m, p.GrossMarginPct);
        Assert.Equal(5000m, p.PreviousPeriodRevenue);
        Assert.Equal(100.0m, p.WowRevenueGrowthPct); // ((10000 - 5000) / 5000) * 100 = 100%
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
