using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RetailCategoryInsights.Core.Interfaces;
using RetailCategoryInsights.Infrastructure.Data;
using RetailCategoryInsights.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context setup (SQLite for seamless local dev & test, configurable for SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=retail_insights.db";

builder.Services.AddDbContext<RetailDbContext>(options =>
{
    options.UseSqlite(connectionString);
});

// 2. Dependency Injection registrations
builder.Services.AddScoped<ISalesQueryService, SalesQueryService>();
builder.Services.AddScoped<IInventoryQueryService, InventoryQueryService>();
builder.Services.AddHttpClient<IAiInsightService, AiInsightService>();

// 3. JWT Authentication Setup
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyForRetailCategoryInsightsDashboard2026!";
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// 4. CORS Policy for Angular Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 5. Swagger OpenAPI Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Retail Category Insights API",
        Version = "v1",
        Description = "API providing category sales analytics, stockout risk assessments, windowed trend calculations, and AI insights."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Database Migration & Automatic Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RetailDbContext>();
    await DataSeeder.SeedAsync(dbContext);
}

// 7. Middleware Pipeline
app.UseCors("AllowAngularDev");

// Force no-cache on swagger endpoints so browsers never serve a stale response
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/swagger"))
    {
        context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
        context.Response.Headers["Pragma"] = "no-cache";
    }
    await next();
});

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Retail Category Insights API v1");
    c.RoutePrefix = "swagger";
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SPA Fallback for Angular frontend routes
app.MapFallbackToFile("index.html");

app.Run();
