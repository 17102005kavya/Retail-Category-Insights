namespace RetailCategoryInsights.Core.Entities;

public class DailySale
{
    public long Id { get; set; }
    public int ProductId { get; set; }
    public int StoreId { get; set; }
    public DateTime SaleDate { get; set; }
    public int UnitsSold { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCost { get; set; }

    public Product Product { get; set; } = null!;
    public Store Store { get; set; } = null!;
}
