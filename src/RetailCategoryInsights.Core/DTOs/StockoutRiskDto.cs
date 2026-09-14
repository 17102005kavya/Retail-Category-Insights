namespace RetailCategoryInsights.Core.DTOs;

public record StockoutRiskDto(
    int ProductId,
    string SKU,
    string ProductName,
    string CategoryName,
    int StoreId,
    string StoreName,
    int CurrentStock,
    int ReorderPoint,
    double AvgDailySalesVelocity,
    double EstimatedDaysOfSupply,
    string RiskLevel, // "CRITICAL", "HIGH", "MEDIUM"
    DateTime LastUpdated
);
