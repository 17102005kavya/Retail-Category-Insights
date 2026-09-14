namespace RetailCategoryInsights.Core.DTOs;

public record AiInsightDto(
    int CategoryId,
    string CategoryName,
    string Summary,
    List<string> KeyHighlights,
    List<string> ActionableRecommendations,
    double ConfidenceScore,
    DateTime GeneratedAt,
    string ModelUsed
);

public record InsightRequestDto(
    string? CustomPrompt
);
