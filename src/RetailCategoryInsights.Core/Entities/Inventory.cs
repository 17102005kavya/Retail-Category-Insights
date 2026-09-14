namespace RetailCategoryInsights.Core.Entities;

public class Inventory
{
    public long Id { get; set; }
    public int ProductId { get; set; }
    public int StoreId { get; set; }
    public DateTime AsOfDate { get; set; }
    public int StockQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public string ReorderStatus { get; set; } = "Normal";

    public Product Product { get; set; } = null!;
    public Store Store { get; set; } = null!;
}
