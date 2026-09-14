using RetailCategoryInsights.Core.DTOs;

namespace RetailCategoryInsights.Core.Interfaces;

public interface IAiInsightService
{
    Task<AiInsightDto> GenerateCategoryInsightAsync(int categoryId, string? customPrompt = null);
}
