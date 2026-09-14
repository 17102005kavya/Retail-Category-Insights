namespace RetailCategoryInsights.Core.Entities;

public class Product
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal CostPrice { get; set; }
    public int ReorderPoint { get; set; }
    public int TargetStockLevel { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<DailySale> DailySales { get; set; } = new List<DailySale>();
    public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
}
