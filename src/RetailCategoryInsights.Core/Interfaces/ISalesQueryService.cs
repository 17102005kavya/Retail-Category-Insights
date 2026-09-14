using RetailCategoryInsights.Core.DTOs;

namespace RetailCategoryInsights.Core.Interfaces;

public interface ISalesQueryService
{
    Task<List<TopProductDto>> GetTopProductsByCategoryAsync(int categoryId, string range, int limit = 10);
    Task<SalesTrendDto> GetSalesTrendAsync(int? categoryId, string range);
    Task<List<CategoryDto>> GetAllCategoriesAsync();
}
