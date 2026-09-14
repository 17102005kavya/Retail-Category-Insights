using Microsoft.EntityFrameworkCore;
using RetailCategoryInsights.Core.Entities;

namespace RetailCategoryInsights.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(RetailDbContext context)
    {
        // Ensure database tables are created
        await context.Database.EnsureCreatedAsync();

        if (await context.Categories.AnyAsync())
        {
            return; // Data already seeded
        }

        var random = new Random(42); // Seeded random for deterministic, reproducible retail data

        // 1. Seed 10 Categories
        var categories = new List<Category>
        {
            new() { Name = "Consumer Electronics", Code = "ELEC", Description = "Laptops, smartphones, audio, and wearables", TargetMarginPct = 28.5m },
            new() { Name = "Fashion & Apparel", Code = "FASH", Description = "Apparel, footwear, and accessories", TargetMarginPct = 45.0m },
            new() { Name = "Home & Kitchen", Code = "HOME", Description = "Cookware, appliances, and home decor", TargetMarginPct = 38.0m },
            new() { Name = "Beauty & Personal Care", Code = "BEAU", Description = "Skincare, cosmetics, and grooming", TargetMarginPct = 52.0m },
            new() { Name = "Sports & Fitness", Code = "SPRT", Description = "Exercise gear, activewear, and outdoor equipment", TargetMarginPct = 35.0m },
            new() { Name = "Gourmet Grocery", Code = "GROC", Description = "Specialty foods, organic snacks, and beverages", TargetMarginPct = 25.0m },
            new() { Name = "Toys & Hobbies", Code = "TOYS", Description = "Board games, action figures, and educational toys", TargetMarginPct = 40.0m },
            new() { Name = "Books & Stationery", Code = "BOOK", Description = "Bestsellers, journals, and office supplies", TargetMarginPct = 42.0m },
            new() { Name = "Automotive Accessories", Code = "AUTO", Description = "Car care, electronics, and tools", TargetMarginPct = 33.0m },
            new() { Name = "Pet Care & Supplies", Code = "PETS", Description = "Pet food, toys, and grooming supplies", TargetMarginPct = 36.0m }
        };

        context.Categories.AddRange(categories);
        await context.SaveChangesAsync();

        // 2. Seed 5 Stores
        var stores = new List<Store>
        {
            new() { Name = "Downtown Flagship Store", Location = "100 Main St, Metropolis", Region = "North" },
            new() { Name = "Suburban Mall Outlet", Location = "450 Galleria Blvd, Suburbia", Region = "East" },
            new() { Name = "Metro Center Express", Location = "88 Transit Plaza, Metro Center", Region = "Central" },
            new() { Name = "Tech Corridor Hub", Location = "1200 Innovation Way, Silicon Park", Region = "West" },
            new() { Name = "Seaside Galleria", Location = "500 Ocean Avenue, Coastal City", Region = "South" }
        };

        context.Stores.AddRange(stores);
        await context.SaveChangesAsync();

        // 3. Seed 50 Products (5 per Category)
        var products = new List<Product>();
        int skuIndex = 100;

        foreach (var category in categories)
        {
            var productTemplates = GetProductTemplatesForCategory(category.Code);
            foreach (var template in productTemplates)
            {
                skuIndex++;
                products.Add(new Product
                {
                    CategoryId = category.Id,
                    SKU = $"{category.Code}-{skuIndex}",
                    Name = template.Name,
                    UnitPrice = template.Price,
                    CostPrice = template.Cost,
                    ReorderPoint = template.ReorderPoint,
                    TargetStockLevel = template.TargetStockLevel
                });
            }
        }

        context.Products.AddRange(products);
        await context.SaveChangesAsync();

        // 4. Seed Daily Sales and Inventory over 180 Days (~6 Months)
        var endDate = DateTime.UtcNow.Date;
        var startDate = endDate.AddDays(-180);

        var dailySalesList = new List<DailySale>();
        var inventoryList = new List<Inventory>();

        // Track running stock quantity per (productId, storeId)
        var currentStocks = new Dictionary<(int ProductId, int StoreId), int>();

        // Initialize starting stock levels
        foreach (var prod in products)
        {
            foreach (var store in stores)
            {
                // Give some stores deliberately lower stock on recent days to simulate stockout risk
                int initialStock = random.Next(prod.ReorderPoint, prod.TargetStockLevel + 30);
                currentStocks[(prod.Id, store.Id)] = initialStock;
            }
        }

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            bool isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;

            foreach (var prod in products)
            {
                foreach (var store in stores)
                {
                    int currentStock = currentStocks[(prod.Id, store.Id)];

                    // Generate sales velocity
                    double baseDemand = random.NextDouble() * 4.0;
                    if (isWeekend) baseDemand *= 1.5;

                    // Electronics & High-val items sell fewer units, grocery/beauty sell higher units
                    if (prod.UnitPrice > 300) baseDemand *= 0.4;
                    if (prod.UnitPrice < 30) baseDemand *= 2.0;

                    int unitsSold = (int)Math.Round(baseDemand);
                    // Cannot sell more than available stock
                    unitsSold = Math.Min(unitsSold, currentStock);

                    if (unitsSold > 0)
                    {
                        var sale = new DailySale
                        {
                            ProductId = prod.Id,
                            StoreId = store.Id,
                            SaleDate = date,
                            UnitsSold = unitsSold,
                            UnitPrice = prod.UnitPrice,
                            TotalRevenue = unitsSold * prod.UnitPrice,
                            TotalCost = unitsSold * prod.CostPrice
                        };
                        dailySalesList.Add(sale);
                        currentStock -= unitsSold;
                    }

                    // Simulated replenishment logic (Replenish if stock falls below reorder point EXCEPT for a selected group of products in recent 15 days)
                    bool isRecentDay = (endDate - date).TotalDays <= 15;
                    bool forceStockoutForDemo = (prod.Id % 7 == 0 || prod.Id % 11 == 0) && store.Id <= 3;

                    if (currentStock <= prod.ReorderPoint)
                    {
                        if (!isRecentDay || !forceStockoutForDemo)
                        {
                            // Trigger reorder batch
                            currentStock += (prod.TargetStockLevel - currentStock);
                        }
                    }

                    currentStocks[(prod.Id, store.Id)] = currentStock;

                    // Add inventory record for key dates or latest date (to keep DB size optimized while realistic)
                    // We record inventory snapshot every 7 days and every day in the last 30 days
                    if (date.DayOfWeek == DayOfWeek.Sunday || (endDate - date).TotalDays <= 30)
                    {
                        string status = currentStock == 0 ? "Stockout" :
                                       currentStock <= (prod.ReorderPoint / 2) ? "Critical" :
                                       currentStock <= prod.ReorderPoint ? "LowStock" : "Normal";

                        inventoryList.Add(new Inventory
                        {
                            ProductId = prod.Id,
                            StoreId = store.Id,
                            AsOfDate = date,
                            StockQuantity = currentStock,
                            ReservedQuantity = random.Next(0, Math.Max(1, currentStock / 4)),
                            ReorderStatus = status
                        });
                    }
                }
            }
        }

        // Bulk insert in chunks to ensure fast seed execution
        await context.DailySales.AddRangeAsync(dailySalesList);
        await context.Inventories.AddRangeAsync(inventoryList);
        await context.SaveChangesAsync();
    }

    private record ProductTemplate(string Name, decimal Price, decimal Cost, int ReorderPoint, int TargetStockLevel);

    private static List<ProductTemplate> GetProductTemplatesForCategory(string categoryCode) => categoryCode switch
    {
        "ELEC" => new List<ProductTemplate>
        {
            new("ProBook 15.6 Inch Laptop", 1199.99m, 850.00m, 15, 60),
            new("Noise-Canceling Wireless Headphones", 249.99m, 140.00m, 25, 100),
            new("Ultra HD Smart Watch Series 5", 329.99m, 200.00m, 20, 80),
            new("Ergonomic Wireless Mechanical Keyboard", 129.99m, 70.00m, 30, 120),
            new("4K USB-C Studio Monitor 27\"", 499.99m, 330.00m, 10, 40)
        },
        "FASH" => new List<ProductTemplate>
        {
            new("Premium Slim Fit Oxford Shirt", 69.99m, 30.00m, 40, 150),
            new("All-Weather Waterproof Jacket", 159.99m, 80.00m, 25, 100),
            new("Classic Genuine Leather Boots", 189.99m, 95.00m, 20, 80),
            new("Designer Denim Jeans", 99.99m, 45.00m, 35, 140),
            new("Merino Wool Crewneck Sweater", 89.99m, 42.00m, 30, 120)
        },
        "HOME" => new List<ProductTemplate>
        {
            new("Stainless Steel 10-Piece Cookware Set", 299.99m, 170.00m, 15, 60),
            new("Smart Air Purifier with HEPA Filter", 199.99m, 110.00m, 20, 75),
            new("Espresso & Cappuccino Maker", 349.99m, 210.00m, 12, 50),
            new("Memory Foam Ergonomic Pillow", 49.99m, 22.00m, 50, 200),
            new("Robot Vacuum with Mop Combo", 399.99m, 240.00m, 15, 60)
        },
        "BEAU" => new List<ProductTemplate>
        {
            new("Hydrating Hyaluronic Face Serum", 45.00m, 15.00m, 50, 200),
            new("Anti-Aging Overnight Cream 50ml", 68.00m, 25.00m, 40, 160),
            new("Organic Vitamin C Brightening Cleanser", 28.00m, 9.00m, 60, 250),
            new("Sonic Facial Cleansing Brush", 89.00m, 35.00m, 30, 120),
            new("Nourishing Botanical Hair Mask", 34.00m, 12.00m, 45, 180)
        },
        "SPRT" => new List<ProductTemplate>
        {
            new("Non-Slip Eco-Friendly Yoga Mat", 49.99m, 20.00m, 40, 160),
            new("Adjustable Cast Iron Dumbbell Set", 179.99m, 100.00m, 20, 70),
            new("Lightweight Trail Running Shoes", 129.99m, 65.00m, 30, 110),
            new("Insulated Stainless Water Bottle 1L", 29.99m, 11.00m, 60, 250),
            new("GPS Multisport Fitness Tracker", 219.99m, 130.00m, 25, 90)
        },
        "GROC" => new List<ProductTemplate>
        {
            new("Single-Origin Cold Brew Coffee Beans 1kg", 24.99m, 12.00m, 60, 250),
            new("Extra Virgin Organic Olive Oil 750ml", 19.99m, 10.00m, 50, 200),
            new("Artisanal Raw Wildflower Honey", 14.99m, 6.50m, 70, 300),
            new("Matcha Green Tea Ceremonial Grade", 29.99m, 14.00m, 45, 180),
            new("Gourmet Mixed Roasted Nuts 500g", 16.99m, 8.00m, 65, 260)
        },
        "TOYS" => new List<ProductTemplate>
        {
            new("Strategy Board Game - Empire Builders", 49.99m, 24.00m, 30, 120),
            new("Programmable STEM Robotics Kit", 119.99m, 65.00m, 20, 80),
            new("1000-Piece Panoramic Jigsaw Puzzle", 24.99m, 10.00m, 45, 180),
            new("Remote Control Quadcopter Drone", 89.99m, 45.00m, 25, 100),
            new("Wooden Classic Railway Set 50pcs", 59.99m, 28.00m, 35, 140)
        },
        "BOOK" => new List<ProductTemplate>
        {
            new("The Modern Retail Leader - Hardcover", 27.99m, 12.00m, 40, 160),
            new("Minimalist Bullet Journal & Pen Set", 19.99m, 7.50m, 60, 240),
            new("Mastering Data Engineering Handbook", 54.99m, 28.00m, 25, 100),
            new("Illustrated World Atlas 2026", 39.99m, 18.00m, 30, 120),
            new("Fountain Pen Calligraphy Kit", 34.99m, 14.00m, 35, 140)
        },
        "AUTO" => new List<ProductTemplate>
        {
            new("Smart Dash Cam 4K Front & Rear", 149.99m, 80.00m, 20, 80),
            new("Digital Portable Air Compressor", 49.99m, 24.00m, 40, 150),
            new("Heavy Duty Car Battery Jump Starter", 99.99m, 52.00m, 25, 100),
            new("Ceramic Car Wash & Coating Kit", 39.99m, 16.00m, 50, 200),
            new("Wireless OBD2 Car Diagnostic Scanner", 59.99m, 28.00m, 35, 130)
        },
        _ => new List<ProductTemplate>
        {
            new("Grain-Free Premium Dog Food 12kg", 69.99m, 38.00m, 35, 140),
            new("Interactive Automatic Laser Cat Toy", 29.99m, 12.00m, 50, 200),
            new("Orthopedic Waterproof Pet Bed Large", 89.99m, 45.00m, 20, 80),
            new("Stainless Steel Smart Pet Water Fountain", 44.99m, 20.00m, 40, 160),
            new("Multi-Level Cat Tree Tower with Scratching Posts", 119.99m, 65.00m, 15, 60)
        }
    };
}
