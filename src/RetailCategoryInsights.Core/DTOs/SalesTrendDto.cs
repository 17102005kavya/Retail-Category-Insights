namespace RetailCategoryInsights.Core.DTOs;

public record DailySalesTrendPoint(
    DateTime Date,
    decimal Revenue,
    int UnitsSold,
    decimal GrossProfit
);

public record SalesTrendDto(
    int? CategoryId,
    string CategoryName,
    string Range,
    decimal TotalRevenue,
    int TotalUnitsSold,
    decimal AverageDailyRevenue,
    decimal WowRevenueChangePct,
    List<DailySalesTrendPoint> DataPoints
);
