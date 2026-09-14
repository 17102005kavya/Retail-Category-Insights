using RetailCategoryInsights.Core.DTOs;

namespace RetailCategoryInsights.Core.Interfaces;

public interface IInventoryQueryService
{
    Task<List<StockoutRiskDto>> GetStockoutRiskProductsAsync(int limit = 15);
}
