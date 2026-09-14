using Microsoft.AspNetCore.Mvc;
using RetailCategoryInsights.Core.DTOs;
using RetailCategoryInsights.Core.Interfaces;

namespace RetailCategoryInsights.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ISalesQueryService _salesQueryService;

    public CategoriesController(ISalesQueryService salesQueryService)
    {
        _salesQueryService = salesQueryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        var categories = await _salesQueryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("{id:int}/top-products")]
    public async Task<ActionResult<List<TopProductDto>>> GetTopProducts(int id, [FromQuery] string range = "30d", [FromQuery] int limit = 10)
    {
        var topProducts = await _salesQueryService.GetTopProductsByCategoryAsync(id, range, limit);
        return Ok(topProducts);
    }
}
