import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopProduct } from '../models/retail.models';

@Component({
  selector: 'app-top-products-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-card glass-card">
      <div class="table-header">
        <div>
          <h3 class="table-title">Top Performing Products</h3>
          <p class="table-subtitle">Revenue, gross profit margins & Period-over-Period growth</p>
        </div>
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search SKU or product..." 
            class="search-input"
          />
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-sku">SKU</th>
              <th class="th-product">Product Name</th>
              <th class="text-right">Units Sold</th>
              <th class="text-right">Revenue</th>
              <th class="text-center">Gross Margin</th>
              <th class="text-center">WoW Growth</th>
              <th class="text-right">Current Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProducts" class="table-row">
              <td class="sku-cell">
                <span class="sku-pill">{{ p.sku }}</span>
              </td>
              <td class="product-cell">
                <span class="product-name">{{ p.productName }}</span>
              </td>
              <td class="text-right num-cell">{{ p.totalUnitsSold | number:'1.0-0' }}</td>
              <td class="text-right num-cell revenue-cell">\${{ p.totalRevenue | number:'1.2-2' }}</td>
              <td class="text-center">
                <div class="margin-cell">
                  <span class="margin-label">{{ p.grossMarginPct | number:'1.1-1' }}%</span>
                  <div class="margin-bar-track">
                    <div class="margin-bar-fill" [style.width.%]="Math.min(100, p.grossMarginPct * 1.5)"></div>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <span [class]="p.wowRevenueGrowthPct >= 0 ? 'badge badge-emerald' : 'badge badge-rose'">
                  {{ p.wowRevenueGrowthPct >= 0 ? '▲ +' : '▼ ' }}{{ p.wowRevenueGrowthPct | number:'1.1-1' }}%
                </span>
              </td>
              <td class="text-right">
                <span [class]="p.currentStock <= 5 ? 'stock-pill critical' : p.currentStock <= 15 ? 'stock-pill low' : 'stock-pill normal'">
                  {{ p.currentStock }} units
                </span>
              </td>
            </tr>

            <tr *ngIf="filteredProducts.length === 0">
              <td colspan="7" class="empty-cell">
                No products found matching "{{ searchQuery }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table-card {
      padding: 24px;
      margin-bottom: 24px;
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .table-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }
    .table-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 7px 14px;
      color: var(--text-muted);
      transition: all 0.2s ease;
    }
    .search-box:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .search-input {
      background: none;
      border: none;
      outline: none;
      color: #fff;
      font-size: 0.84rem;
      width: 190px;
    }
    .search-input::placeholder {
      color: var(--text-dim);
    }

    .table-container {
      overflow-x: auto;
      border-radius: var(--radius-sm);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }
    .data-table th {
      padding: 12px 14px;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }
    .data-table td {
      padding: 13px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-main);
      vertical-align: middle;
    }
    .table-row {
      transition: background-color 0.15s ease;
    }
    .table-row:hover {
      background: rgba(255, 255, 255, 0.035);
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }

    .sku-cell {
      white-space: nowrap;
      width: 110px;
    }
    .sku-pill {
      font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
      font-size: 0.76rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(99, 102, 241, 0.25);
      white-space: nowrap;
      letter-spacing: 0.02em;
    }

    .product-cell {
      max-width: 240px;
    }
    .product-name {
      font-weight: 600;
      color: #ffffff;
      display: inline-block;
      line-height: 1.35;
    }

    .num-cell {
      font-variant-numeric: tabular-nums;
      font-size: 0.88rem;
    }
    .revenue-cell {
      font-weight: 700;
      color: #ffffff;
    }

    .margin-cell {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 80px;
    }
    .margin-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #f1f5f9;
      font-variant-numeric: tabular-nums;
    }
    .margin-bar-track {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
    }
    .margin-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      border-radius: 9999px;
    }

    .stock-pill {
      font-size: 0.76rem;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 6px;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      display: inline-block;
    }
    .stock-pill.normal { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
    .stock-pill.low { background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); }
    .stock-pill.critical { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }

    .empty-cell {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
  `]
})
export class TopProductsTableComponent {
  @Input() products: TopProduct[] = [];
  searchQuery = '';
  Math = Math;

  get filteredProducts(): TopProduct[] {
    if (!this.searchQuery.trim()) return this.products;
    const q = this.searchQuery.toLowerCase();
    return this.products.filter(p =>
      p.productName.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }
}
