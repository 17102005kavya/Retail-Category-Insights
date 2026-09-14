export interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  targetMarginPct: number;
  productCount: number;
}

export interface TopProduct {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  totalUnitsSold: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPct: number;
  previousPeriodRevenue: number;
  wowRevenueGrowthPct: number;
  currentStock: number;
}

export interface StockoutRisk {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  storeId: number;
  storeName: string;
  currentStock: number;
  reorderPoint: number;
  avgDailySalesVelocity: number;
  estimatedDaysOfSupply: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  lastUpdated: string;
}

export interface DailySalesTrendPoint {
  date: string;
  revenue: number;
  unitsSold: number;
  grossProfit: number;
}

export interface SalesTrend {
  categoryId?: number;
  categoryName: string;
  range: string;
  totalRevenue: number;
  totalUnitsSold: number;
  averageDailyRevenue: number;
  wowRevenueChangePct: number;
  dataPoints: DailySalesTrendPoint[];
}

export interface AiInsight {
  categoryId: number;
  categoryName: string;
  summary: string;
  keyHighlights: string[];
  actionableRecommendations: string[];
  confidenceScore: number;
  generatedAt: string;
  modelUsed: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}
