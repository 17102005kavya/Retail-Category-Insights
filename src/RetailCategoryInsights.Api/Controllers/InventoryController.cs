using Microsoft.AspNetCore.Mvc;
using RetailCategoryInsights.Core.DTOs;
using RetailCategoryInsights.Core.Interfaces;

namespace RetailCategoryInsights.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryQueryService _inventoryQueryService;

    public InventoryController(IInventoryQueryService inventoryQueryService)
    {
        _inventoryQueryService = inventoryQueryService;
    }

    [HttpGet("stockout-risk")]
    public async Task<ActionResult<List<StockoutRiskDto>>> GetStockoutRisk([FromQuery] int limit = 15)
    {
        var risks = await _inventoryQueryService.GetStockoutRiskProductsAsync(limit);
        return Ok(risks);
    }
}
