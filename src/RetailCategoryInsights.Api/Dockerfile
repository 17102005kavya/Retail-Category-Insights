# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for caching layer
COPY src/RetailCategoryInsights.Core/RetailCategoryInsights.Core.csproj src/RetailCategoryInsights.Core/
COPY src/RetailCategoryInsights.Infrastructure/RetailCategoryInsights.Infrastructure.csproj src/RetailCategoryInsights.Infrastructure/
COPY src/RetailCategoryInsights.Api/RetailCategoryInsights.Api.csproj src/RetailCategoryInsights.Api/

# Restore dependencies
RUN dotnet restore src/RetailCategoryInsights.Api/RetailCategoryInsights.Api.csproj

# Copy all source files
COPY src/RetailCategoryInsights.Core/ src/RetailCategoryInsights.Core/
COPY src/RetailCategoryInsights.Infrastructure/ src/RetailCategoryInsights.Infrastructure/
COPY src/RetailCategoryInsights.Api/ src/RetailCategoryInsights.Api/

# Build and publish
WORKDIR /src/src/RetailCategoryInsights.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose API port
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "RetailCategoryInsights.Api.dll"]
