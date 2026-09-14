namespace RetailCategoryInsights.Core.Entities;

public class Store
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;

    public ICollection<DailySale> DailySales { get; set; } = new List<DailySale>();
    public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
}
