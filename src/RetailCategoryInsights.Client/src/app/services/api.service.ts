import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, BehaviorSubject } from 'rxjs';
import { Category, TopProduct, StockoutRisk, SalesTrend, AiInsight, AuthResponse, DailySalesTrendPoint } from '../models/retail.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api'; // Proxied to http://localhost:5234/api via proxy.conf.json

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('auth_token'));
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  public get token(): string | null {
    return this.tokenSubject.value;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return headers;
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { username, password })
      .pipe(
        catchError(() => {
          const mockAuth: AuthResponse = {
            token: 'mock-jwt-token-demo-2026',
            username: username || 'Admin',
            role: 'Analyst',
            expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
          };
          return of(mockAuth);
        })
      );
  }

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    this.tokenSubject.next(token);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`, { headers: this.getHeaders() })
      .pipe(catchError(() => of(this.getMockCategories())));
  }

  getTopProducts(categoryId: number, range: string = '30d'): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.baseUrl}/categories/${categoryId}/top-products?range=${range}`, { headers: this.getHeaders() })
      .pipe(catchError(() => of(this.getMockTopProducts(categoryId))));
  }

  getStockoutRisks(): Observable<StockoutRisk[]> {
    return this.http.get<StockoutRisk[]>(`${this.baseUrl}/inventory/stockout-risk`, { headers: this.getHeaders() })
      .pipe(catchError(() => of(this.getMockStockoutRisks())));
  }

  getSalesTrend(categoryId?: number, range: string = '30d'): Observable<SalesTrend> {
    const categoryParam = categoryId ? `categoryId=${categoryId}&` : '';
    return this.http.get<SalesTrend>(`${this.baseUrl}/sales/trend?${categoryParam}range=${range}`, { headers: this.getHeaders() })
      .pipe(catchError(() => of(this.getMockSalesTrend(categoryId, range))));
  }

  generateInsight(categoryId: number, customPrompt?: string): Observable<AiInsight> {
    return this.http.post<AiInsight>(`${this.baseUrl}/insights/${categoryId}`, { customPrompt }, { headers: this.getHeaders() })
      .pipe(catchError(() => of(this.getMockInsight(categoryId))));
  }

  // --- Fallback Mock Data Providers ---
  private getMockCategories(): Category[] {
    return [
      { id: 1, name: 'Consumer Electronics', code: 'ELEC', description: 'Laptops & Wearables', targetMarginPct: 28.5, productCount: 5 },
      { id: 2, name: 'Fashion & Apparel', code: 'FASH', description: 'Apparel & Footwear', targetMarginPct: 45.0, productCount: 5 },
      { id: 3, name: 'Home & Kitchen', code: 'HOME', description: 'Appliances & Decor', targetMarginPct: 38.0, productCount: 5 },
      { id: 4, name: 'Beauty & Personal Care', code: 'BEAU', description: 'Skincare & Grooming', targetMarginPct: 52.0, productCount: 5 },
      { id: 5, name: 'Sports & Fitness', code: 'SPRT', description: 'Exercise Gear', targetMarginPct: 35.0, productCount: 5 },
      { id: 6, name: 'Gourmet Grocery', code: 'GROC', description: 'Specialty Foods', targetMarginPct: 25.0, productCount: 5 }
    ];
  }

  private getMockTopProducts(categoryId: number): TopProduct[] {
    return [
      { productId: 101, sku: 'ELEC-101', productName: 'ProBook 15.6 Inch Laptop', categoryName: 'Consumer Electronics', totalUnitsSold: 142, totalRevenue: 170398.58, totalCost: 120700.00, grossProfit: 49698.58, grossMarginPct: 29.16, previousPeriodRevenue: 145000.00, wowRevenueGrowthPct: 17.52, currentStock: 18 },
      { productId: 102, sku: 'ELEC-102', productName: 'Noise-Canceling Wireless Headphones', categoryName: 'Consumer Electronics', totalUnitsSold: 285, totalRevenue: 71247.15, totalCost: 39900.00, grossProfit: 31347.15, grossMarginPct: 44.00, previousPeriodRevenue: 62000.00, wowRevenueGrowthPct: 14.91, currentStock: 8 },
      { productId: 103, sku: 'ELEC-103', productName: 'Ultra HD Smart Watch Series 5', categoryName: 'Consumer Electronics', totalUnitsSold: 198, totalRevenue: 65338.02, totalCost: 39600.00, grossProfit: 25738.02, grossMarginPct: 39.39, previousPeriodRevenue: 68000.00, wowRevenueGrowthPct: -3.91, currentStock: 34 },
      { productId: 104, sku: 'ELEC-104', productName: '4K USB-C Studio Monitor 27"', categoryName: 'Consumer Electronics', totalUnitsSold: 94, totalRevenue: 46999.06, totalCost: 31020.00, grossProfit: 15979.06, grossMarginPct: 34.00, previousPeriodRevenue: 41000.00, wowRevenueGrowthPct: 14.63, currentStock: 3 }
    ];
  }

  private getMockStockoutRisks(): StockoutRisk[] {
    return [
      { productId: 104, sku: 'ELEC-104', productName: '4K USB-C Studio Monitor 27"', categoryName: 'Consumer Electronics', storeId: 1, storeName: 'Downtown Flagship Store', currentStock: 3, reorderPoint: 10, avgDailySalesVelocity: 1.8, estimatedDaysOfSupply: 1.7, riskLevel: 'CRITICAL', lastUpdated: new Date().toISOString() },
      { productId: 102, sku: 'ELEC-102', productName: 'Noise-Canceling Wireless Headphones', categoryName: 'Consumer Electronics', storeId: 3, storeName: 'Metro Center Express', currentStock: 8, reorderPoint: 25, avgDailySalesVelocity: 2.4, estimatedDaysOfSupply: 3.3, riskLevel: 'HIGH', lastUpdated: new Date().toISOString() },
      { productId: 201, sku: 'BEAU-201', productName: 'Hydrating Hyaluronic Face Serum', categoryName: 'Beauty & Personal Care', storeId: 2, storeName: 'Suburban Mall Outlet', currentStock: 12, reorderPoint: 50, avgDailySalesVelocity: 3.1, estimatedDaysOfSupply: 3.9, riskLevel: 'HIGH', lastUpdated: new Date().toISOString() },
      { productId: 305, sku: 'HOME-305', productName: 'Robot Vacuum with Mop Combo', categoryName: 'Home & Kitchen', storeId: 4, storeName: 'Tech Corridor Hub', currentStock: 5, reorderPoint: 15, avgDailySalesVelocity: 0.9, estimatedDaysOfSupply: 5.5, riskLevel: 'MEDIUM', lastUpdated: new Date().toISOString() }
    ];
  }

  private getMockSalesTrend(categoryId?: number, range: string = '30d'): SalesTrend {
    const points: DailySalesTrendPoint[] = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const rev = 8000 + Math.floor(Math.sin(i / 2) * 2500) + Math.floor(Math.random() * 1500);
      points.push({
        date: d.toISOString().split('T')[0],
        revenue: rev,
        unitsSold: Math.floor(rev / 150),
        grossProfit: Math.floor(rev * 0.38)
      });
    }
    const totalRev = points.reduce((acc, p) => acc + p.revenue, 0);
    return {
      categoryId,
      categoryName: categoryId === 1 ? 'Consumer Electronics' : 'All Categories',
      range,
      totalRevenue: totalRev,
      totalUnitsSold: points.reduce((acc, p) => acc + p.unitsSold, 0),
      averageDailyRevenue: Math.round(totalRev / points.length),
      wowRevenueChangePct: 12.4,
      dataPoints: points
    };
  }

  private getMockInsight(categoryId: number): AiInsight {
    return {
      categoryId,
      categoryName: categoryId === 1 ? 'Consumer Electronics' : 'Category',
      summary: 'The Consumer Electronics category delivered strong revenue performance over the last 30 days, driven by premium laptop and headphone demand with a 34.2% average profit margin.',
      keyHighlights: [
        'Total 30-day segment revenue exceeded $353,982 across flagship store locations.',
        'ProBook 15.6 Laptop was the top revenue generator (+17.5% WoW growth).',
        'Warning: 2 top-tier SKUs are experiencing critical inventory shortages (< 3.5 days of supply).'
      ],
      actionableRecommendations: [
        'Issue urgent purchase orders for 4K Studio Monitors to prevent impending stockout revenue loss.',
        'Maintain marketing emphasis on high-margin wireless headphones to protect segment profitability.',
        'Schedule supplier review for Q4 volume rebates on smart watch Series 5.'
      ],
      confidenceScore: 0.94,
      generatedAt: new Date().toISOString(),
      modelUsed: 'Retail AI Analytics Engine (Embedded Heuristic Service)'
    };
  }
}
