import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metrics-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metrics-grid">
      <!-- Card 1: Revenue -->
      <div class="metric-card glass-card">
        <div class="metric-header">
          <span class="metric-title">Total Revenue</span>
          <div class="metric-icon indigo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
        </div>
        <div class="metric-value">\${{ totalRevenue | number:'1.0-0' }}</div>
        <div class="metric-footer">
          <span [class]="wowGrowth >= 0 ? 'badge badge-emerald' : 'badge badge-rose'">
            {{ wowGrowth >= 0 ? '▲ +' : '▼ ' }}{{ wowGrowth | number:'1.1-1' }}% WoW
          </span>
          <span class="metric-subtext">vs previous {{ range }}</span>
        </div>
      </div>

      <!-- Card 2: Units Sold -->
      <div class="metric-card glass-card">
        <div class="metric-header">
          <span class="metric-title">Total Volume</span>
          <div class="metric-icon emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
        </div>
        <div class="metric-value">{{ totalUnitsSold | number:'1.0-0' }} <span class="unit">units</span></div>
        <div class="metric-footer">
          <span class="badge badge-indigo">Daily Avg: {{ avgDailyRevenue | number:'1.0-0' }}</span>
          <span class="metric-subtext">units across stores</span>
        </div>
      </div>

      <!-- Card 3: Gross Profit Margin -->
      <div class="metric-card glass-card">
        <div class="metric-header">
          <span class="metric-title">Avg Gross Margin</span>
          <div class="metric-icon amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
        </div>
        <div class="metric-value">{{ avgMargin | number:'1.1-1' }}%</div>
        <div class="metric-footer">
          <span class="badge badge-emerald">Target: {{ targetMargin | number:'1.0-0' }}%</span>
          <span class="metric-subtext">category target</span>
        </div>
      </div>

      <!-- Card 4: Critical Stockout Risk -->
      <div class="metric-card glass-card">
        <div class="metric-header">
          <span class="metric-title">Stockout Alert</span>
          <div class="metric-icon rose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>
        <div class="metric-value">{{ criticalStockCount }} <span class="unit">SKUs</span></div>
        <div class="metric-footer">
          <span [class]="criticalStockCount > 0 ? 'badge badge-rose' : 'badge badge-emerald'">
            {{ criticalStockCount > 0 ? 'Action Required' : 'Optimal Inventory' }}
          </span>
          <span class="metric-subtext">&lt; 5 days supply</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card {
      padding: 20px 22px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
      border-color: rgba(255, 255, 255, 0.16);
    }
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .metric-title {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .metric-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    .metric-card:hover .metric-icon {
      transform: scale(1.05);
    }
    .metric-icon.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.25); }
    .metric-icon.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); }
    .metric-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); }
    .metric-icon.rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.25); }

    .metric-value {
      font-family: 'Outfit', sans-serif;
      font-size: 1.85rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.15;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }
    .metric-value .unit {
      font-size: 0.95rem;
      font-weight: 400;
      color: var(--text-muted);
      margin-left: 3px;
    }
    .metric-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .metric-subtext {
      font-size: 0.73rem;
      color: var(--text-dim);
    }
  `]
})
export class MetricsOverviewComponent {
  @Input() totalRevenue = 0;
  @Input() totalUnitsSold = 0;
  @Input() avgMargin = 0;
  @Input() targetMargin = 35;
  @Input() wowGrowth = 0;
  @Input() avgDailyRevenue = 0;
  @Input() criticalStockCount = 0;
  @Input() range = '30d';
}
