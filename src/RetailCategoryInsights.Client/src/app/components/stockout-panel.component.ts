import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockoutRisk } from '../models/retail.models';

@Component({
  selector: 'app-stockout-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stockout-card glass-card">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Stockout Risk Monitoring</h3>
          <p class="panel-subtitle">Products with &lt; 5 estimated days of inventory supply</p>
        </div>
        <span class="badge badge-rose">{{ risks.length }} Risk Items</span>
      </div>

      <div class="risk-list">
        <div *ngFor="let r of risks" class="risk-item" [ngClass]="'risk-' + r.riskLevel.toLowerCase()">
          <!-- Top Row: SKU, Product Name, and Risk Level Badge -->
          <div class="risk-header-row">
            <div class="product-identifiers">
              <span class="product-sku">{{ r.sku }}</span>
              <span class="product-name" [title]="r.productName">{{ r.productName }}</span>
            </div>
            <span [class]="r.riskLevel === 'CRITICAL' ? 'badge badge-rose' : r.riskLevel === 'HIGH' ? 'badge badge-amber' : 'badge badge-indigo'">
              {{ r.riskLevel }}
            </span>
          </div>

          <!-- Store / Outlet Info -->
          <div class="store-info">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{{ r.storeName }}</span>
          </div>

          <!-- Bottom Metrics Bar -->
          <div class="risk-metrics-bar">
            <div class="supply-stat">
              <div class="stat-header">
                <span class="stat-title">Estimated Supply</span>
                <span class="supply-value" [class.text-rose]="r.riskLevel === 'CRITICAL'" [class.text-amber]="r.riskLevel === 'HIGH'">
                  {{ r.estimatedDaysOfSupply }} <span class="unit">days</span>
                </span>
              </div>
              <div class="progress-track">
                <div 
                  [class]="'progress-fill ' + r.riskLevel.toLowerCase()"
                  [style.width.%]="Math.min(100, (r.estimatedDaysOfSupply / 10) * 100)"
                ></div>
              </div>
            </div>

            <div class="inventory-split">
              <div class="inv-item">
                <span class="inv-label">Stock</span>
                <span class="inv-val" [class.critical-text]="r.currentStock === 0">{{ r.currentStock }}</span>
              </div>
              <span class="inv-divider">/</span>
              <div class="inv-item">
                <span class="inv-label">Reorder</span>
                <span class="inv-val">{{ r.reorderPoint }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="risks.length === 0" class="empty-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>Optimal Inventory Levels. No Stockout Risk Detected!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stockout-card {
      padding: 24px;
      margin-bottom: 24px;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 18px;
    }
    .panel-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }
    .panel-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .risk-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 540px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .risk-item {
      padding: 14px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: var(--radius-md);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .risk-item.risk-critical {
      border-left: 3px solid #f43f5e;
      background: rgba(244, 63, 94, 0.04);
    }
    .risk-item.risk-high {
      border-left: 3px solid #f59e0b;
      background: rgba(245, 158, 11, 0.03);
    }
    .risk-item.risk-medium {
      border-left: 3px solid #6366f1;
      background: rgba(99, 102, 241, 0.03);
    }
    .risk-item:hover {
      border-color: rgba(255, 255, 255, 0.18);
      background: rgba(15, 23, 42, 0.85);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .risk-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .product-identifiers {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }
    .product-sku {
      font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
      font-size: 0.76rem;
      font-weight: 600;
      background: rgba(244, 63, 94, 0.12);
      color: #fb7185;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid rgba(244, 63, 94, 0.25);
      white-space: nowrap;
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }
    .product-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #f8fafc;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .store-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      color: var(--text-dim);
      margin-bottom: 12px;
    }
    .store-info svg {
      color: var(--text-dim);
      flex-shrink: 0;
    }

    .risk-metrics-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(15, 23, 42, 0.45);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .supply-stat {
      flex: 1;
      min-width: 0;
    }
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 5px;
    }
    .stat-title {
      font-size: 0.7rem;
      color: var(--text-dim);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .supply-value {
      font-size: 0.82rem;
      font-weight: 700;
      color: #fff;
    }
    .supply-value.text-rose { color: #fb7185; }
    .supply-value.text-amber { color: #fbbf24; }
    .supply-value .unit {
      font-size: 0.72rem;
      font-weight: 400;
      color: var(--text-muted);
    }

    .progress-track {
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.4s ease;
    }
    .progress-fill.critical {
      background: linear-gradient(90deg, #f43f5e, #fda4af);
      box-shadow: 0 0 8px rgba(244, 63, 94, 0.5);
    }
    .progress-fill.high {
      background: linear-gradient(90deg, #f59e0b, #fde68a);
    }
    .progress-fill.medium {
      background: linear-gradient(90deg, #6366f1, #a5b4fc);
    }

    .inventory-split {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      padding-left: 12px;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
    }
    .inv-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .inv-label {
      font-size: 0.65rem;
      color: var(--text-dim);
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.03em;
    }
    .inv-val {
      font-size: 0.82rem;
      font-weight: 700;
      color: #f1f5f9;
      font-variant-numeric: tabular-nums;
    }
    .inv-val.critical-text {
      color: #fb7185;
      font-weight: 800;
    }
    .inv-divider {
      color: #475569;
      font-size: 0.8rem;
      font-weight: 300;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 36px 20px;
      color: #34d399;
      font-size: 0.9rem;
      text-align: center;
    }
  `]
})
export class StockoutRiskPanelComponent {
  @Input() risks: StockoutRisk[] = [];
  Math = Math;
}
