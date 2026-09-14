import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Category, TopProduct, StockoutRisk, SalesTrend, AiInsight } from './models/retail.models';

import { HeaderComponent } from './components/header.component';
import { MetricsOverviewComponent } from './components/metrics-overview.component';
import { SalesChartComponent } from './components/sales-chart.component';
import { TopProductsTableComponent } from './components/top-products-table.component';
import { StockoutRiskPanelComponent } from './components/stockout-panel.component';
import { AiInsightComponent } from './components/ai-insight.component';
import { AuthModalComponent } from './components/auth-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    MetricsOverviewComponent,
    SalesChartComponent,
    TopProductsTableComponent,
    StockoutRiskPanelComponent,
    AiInsightComponent,
    AuthModalComponent
  ],
  template: `
    <div class="app-container">
      <!-- Top Navigation Header -->
      <app-header 
        [username]="username"
        (openAuth)="showAuthModal = true"
        (logout)="onLogout()"
      ></app-header>

      <!-- Filter Controls Bar -->
      <div class="filters-card glass-card">
        <div class="filter-group">
          <label class="filter-label">Retail Category</label>
          <select [ngModel]="selectedCategoryId" (ngModelChange)="onCategoryChange($event)" class="filter-select">
            <option [value]="0">All Categories Overview</option>
            <option *ngFor="let c of categories" [value]="c.id">
              {{ c.name }} ({{ c.productCount }} SKUs)
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Time Horizon</label>
          <div class="range-buttons">
            <button 
              *ngFor="let r of rangeOptions" 
              (click)="onRangeChange(r.value)" 
              [class]="selectedRange === r.value ? 'range-btn active' : 'range-btn'"
            >
              {{ r.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Key Performance Indicators (KPI Cards) -->
      <app-metrics-overview
        [totalRevenue]="salesTrend?.totalRevenue || 0"
        [totalUnitsSold]="salesTrend?.totalUnitsSold || 0"
        [avgMargin]="avgMargin"
        [targetMargin]="selectedCategory?.targetMarginPct || 35"
        [wowGrowth]="salesTrend?.wowRevenueChangePct || 0"
        [avgDailyRevenue]="salesTrend?.averageDailyRevenue || 0"
        [criticalStockCount]="stockoutRisks.length"
        [range]="selectedRange"
      ></app-metrics-overview>

      <!-- Main Two Column Grid (Sales Trend + Stockout Risk Panel) -->
      <div class="dashboard-grid">
        <div class="grid-left">
          <!-- Sales Trend Canvas Chart -->
          <app-sales-chart 
            [dataPoints]="salesTrend?.dataPoints || []"
          ></app-sales-chart>

          <!-- Top Products Table -->
          <app-top-products-table
            [products]="topProducts"
          ></app-top-products-table>
        </div>

        <div class="grid-right">
          <!-- AI Category Insight Card -->
          <app-ai-insight
            [insight]="aiInsight"
            [categoryName]="selectedCategoryName"
            [isLoading]="isInsightLoading"
            (generate)="onGenerateInsight($event)"
          ></app-ai-insight>

          <!-- Low Stock Alert Panel -->
          <app-stockout-panel
            [risks]="stockoutRisks"
          ></app-stockout-panel>
        </div>
      </div>

      <!-- Auth JWT Login Modal -->
      <app-auth-modal
        *ngIf="showAuthModal"
        (close)="showAuthModal = false"
        (login)="onLogin($event)"
      ></app-auth-modal>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 24px 28px;
    }
    .filters-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 22px;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .filter-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .filter-select {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 8px 16px;
      color: #fff;
      font-size: 0.88rem;
      font-weight: 500;
      outline: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .range-buttons {
      display: flex;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 3px;
    }
    .range-btn {
      background: none;
      border: none;
      padding: 6px 14px;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .range-btn:hover {
      color: #fff;
    }
    .range-btn.active {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 440px;
      gap: 24px;
      align-items: start;
    }
    .grid-left {
      min-width: 0;
    }
    .grid-right {
      min-width: 0;
    }
    @media (max-width: 1120px) {
      .dashboard-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `]
})
export class AppComponent implements OnInit {
  categories: Category[] = [];
  topProducts: TopProduct[] = [];
  stockoutRisks: StockoutRisk[] = [];
  salesTrend: SalesTrend | null = null;
  aiInsight: AiInsight | null = null;

  selectedCategoryId = 1; // Default to Consumer Electronics
  selectedRange = '30d';
  isInsightLoading = false;

  showAuthModal = false;
  username: string | null = null;

  rangeOptions = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '180 Days', value: '180d' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('auth_username');
    this.loadCategories();
    this.loadDashboardData();
  }

  get selectedCategory(): Category | undefined {
    return this.categories.find(c => c.id === this.selectedCategoryId);
  }

  get selectedCategoryName(): string {
    return this.selectedCategory?.name || 'All Categories';
  }

  get avgMargin(): number {
    if (!this.topProducts || this.topProducts.length === 0) return 0;
    return this.topProducts.reduce((acc, p) => acc + p.grossMarginPct, 0) / this.topProducts.length;
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  loadDashboardData(): void {
    const catId = Number(this.selectedCategoryId);

    this.apiService.getTopProducts(catId > 0 ? catId : 1, this.selectedRange).subscribe(prods => {
      this.topProducts = prods;
    });

    this.apiService.getSalesTrend(catId > 0 ? catId : undefined, this.selectedRange).subscribe(trend => {
      this.salesTrend = trend;
    });

    this.apiService.getStockoutRisks().subscribe(risks => {
      this.stockoutRisks = catId > 0
        ? risks.filter(r => r.categoryName === this.selectedCategoryName || r.productId % 2 === 0)
        : risks;
    });

    this.onGenerateInsight();
  }

  onCategoryChange(newCatId: any): void {
    this.selectedCategoryId = Number(newCatId);
    this.loadDashboardData();
  }

  onRangeChange(newRange: string): void {
    this.selectedRange = newRange;
    this.loadDashboardData();
  }

  onGenerateInsight(customPrompt?: string): void {
    this.isInsightLoading = true;
    const catId = Number(this.selectedCategoryId) > 0 ? Number(this.selectedCategoryId) : 1;
    this.apiService.generateInsight(catId, customPrompt).subscribe(insight => {
      this.aiInsight = insight;
      this.isInsightLoading = false;
    });
  }

  onLogin(credentials: { username: string; password: string }): void {
    this.apiService.login(credentials.username, credentials.password).subscribe(res => {
      this.apiService.setToken(res.token);
      this.username = res.username;
      localStorage.setItem('auth_username', res.username);
      this.showAuthModal = false;
    });
  }

  onLogout(): void {
    this.apiService.setToken(null);
    this.username = null;
    localStorage.removeItem('auth_username');
  }
}
