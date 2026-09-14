using Microsoft.AspNetCore.Mvc;
using RetailCategoryInsights.Core.DTOs;
using RetailCategoryInsights.Core.Interfaces;

namespace RetailCategoryInsights.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISalesQueryService _salesQueryService;

    public SalesController(ISalesQueryService salesQueryService)
    {
        _salesQueryService = salesQueryService;
    }

    [HttpGet("trend")]
    public async Task<ActionResult<SalesTrendDto>> GetSalesTrend([FromQuery] int? categoryId, [FromQuery] string range = "30d")
    {
        var trend = await _salesQueryService.GetSalesTrendAsync(categoryId, range);
        return Ok(trend);
    }
}
