using Microsoft.AspNetCore.Mvc;
using RetailCategoryInsights.Core.DTOs;
using RetailCategoryInsights.Core.Interfaces;

namespace RetailCategoryInsights.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InsightsController : ControllerBase
{
    private readonly IAiInsightService _aiInsightService;

    public InsightsController(IAiInsightService aiInsightService)
    {
        _aiInsightService = aiInsightService;
    }

    [HttpPost("{categoryId:int}")]
    public async Task<ActionResult<AiInsightDto>> GenerateInsight(int categoryId, [FromBody] InsightRequestDto? request)
    {
        var insight = await _aiInsightService.GenerateCategoryInsightAsync(categoryId, request?.CustomPrompt);
        return Ok(insight);
    }
}
