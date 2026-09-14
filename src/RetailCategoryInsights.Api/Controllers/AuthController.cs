using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using RetailCategoryInsights.Core.DTOs;

namespace RetailCategoryInsights.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
    {
        // Simple demo authentication (accepts demo credentials admin/password or retail/password)
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password required" });
        }

        var jwtSecret = _configuration["Jwt:Secret"] ?? "SuperSecretKeyForRetailCategoryInsightsDashboard2026!";
        var key = Encoding.ASCII.GetBytes(jwtSecret);

        var expiresAt = DateTime.UtcNow.AddHours(8);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, request.Username),
                new Claim(ClaimTypes.Role, request.Username.Equals("admin", StringComparison.OrdinalIgnoreCase) ? "Admin" : "Analyst")
            }),
            Expires = expiresAt,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var stringToken = tokenHandler.WriteToken(token);

        return Ok(new AuthResponse(stringToken, request.Username, "Analyst", expiresAt));
    }
}
