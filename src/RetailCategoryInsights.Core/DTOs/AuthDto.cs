namespace RetailCategoryInsights.Core.DTOs;

public record LoginRequest(string Username, string Password);
public record AuthResponse(string Token, string Username, string Role, DateTime ExpiresAt);
