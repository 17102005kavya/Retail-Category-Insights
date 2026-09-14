namespace RetailCategoryInsights.Core.DTOs;

public record CategoryDto(
    int Id,
    string Name,
    string Code,
    string Description,
    decimal TargetMarginPct,
    int ProductCount
);
