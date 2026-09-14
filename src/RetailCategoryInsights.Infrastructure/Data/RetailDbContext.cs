using Microsoft.EntityFrameworkCore;
using RetailCategoryInsights.Core.Entities;

namespace RetailCategoryInsights.Infrastructure.Data;

public class RetailDbContext : DbContext
{
    public RetailDbContext(DbContextOptions<RetailDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Store> Stores => Set<Store>();
    public DbSet<DailySale> DailySales => Set<DailySale>();
    public DbSet<Inventory> Inventories => Set<Inventory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Code).IsRequired().HasMaxLength(20);
            entity.Property(c => c.TargetMarginPct).HasColumnType("decimal(5,2)");
        });

        // Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.SKU).IsRequired().HasMaxLength(50);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.Property(p => p.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(p => p.CostPrice).HasColumnType("decimal(18,2)");

            entity.HasOne(p => p.Category)
                  .WithMany(c => c.Products)
                  .HasForeignKey(p => p.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(p => p.CategoryId).HasDatabaseName("IX_Products_CategoryId");
            entity.HasIndex(p => p.SKU).IsUnique().HasDatabaseName("IX_Products_SKU");
        });

        // Store
        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.Location).HasMaxLength(100);
            entity.Property(s => s.Region).HasMaxLength(50);
        });

        // DailySale
        modelBuilder.Entity<DailySale>(entity =>
        {
            entity.HasKey(ds => ds.Id);
            entity.Property(ds => ds.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(ds => ds.TotalRevenue).HasColumnType("decimal(18,2)");
            entity.Property(ds => ds.TotalCost).HasColumnType("decimal(18,2)");

            entity.HasOne(ds => ds.Product)
                  .WithMany(p => p.DailySales)
                  .HasForeignKey(ds => ds.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ds => ds.Store)
                  .WithMany(s => s.DailySales)
                  .HasForeignKey(ds => ds.StoreId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Optimized Composite & Single Column Indexes for Range Aggregations & Joins
            entity.HasIndex(ds => new { ds.ProductId, ds.SaleDate })
                  .HasDatabaseName("IX_DailySales_ProductId_SaleDate");
            entity.HasIndex(ds => ds.SaleDate)
                  .HasDatabaseName("IX_DailySales_SaleDate");
            entity.HasIndex(ds => new { ds.StoreId, ds.SaleDate })
                  .HasDatabaseName("IX_DailySales_StoreId_SaleDate");
        });

        // Inventory
        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.Property(i => i.ReorderStatus).HasMaxLength(30);

            entity.HasOne(i => i.Product)
                  .WithMany(p => p.Inventories)
                  .HasForeignKey(i => i.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(i => i.Store)
                  .WithMany(s => s.Inventories)
                  .HasForeignKey(i => i.StoreId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Index for fast latest inventory lookup per product and store
            entity.HasIndex(i => new { i.ProductId, i.StoreId, i.AsOfDate })
                  .HasDatabaseName("IX_Inventory_ProductId_StoreId_AsOfDate");
        });
    }
}
