namespace RetailCategoryInsights.Core.DTOs;

public record TopProductDto(
    int ProductId,
    string SKU,
    string ProductName,
    string CategoryName,
    int TotalUnitsSold,
    decimal TotalRevenue,
    decimal TotalCost,
    decimal GrossProfit,
    decimal GrossMarginPct,
    decimal PreviousPeriodRevenue,
    decimal WowRevenueGrowthPct,
    int CurrentStock
);
