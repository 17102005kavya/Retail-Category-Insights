import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailySalesTrendPoint } from '../models/retail.models';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card glass-card">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Daily Revenue & Trend Analytics</h3>
          <p class="chart-subtitle">Category daily sales volume and revenue trajectory</p>
        </div>
        <div class="chart-legend">
          <span class="legend-item"><span class="legend-color indigo"></span> Daily Revenue</span>
          <span class="legend-item"><span class="legend-color emerald"></span> Gross Profit</span>
        </div>
      </div>

      <div class="chart-container">
        <canvas #canvasElement></canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-card {
      padding: 24px;
      margin-bottom: 24px;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .chart-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }
    .chart-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .chart-legend {
      display: flex;
      gap: 16px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .legend-color {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
    .legend-color.indigo { background: #6366f1; }
    .legend-color.emerald { background: #10b981; }

    .chart-container {
      position: relative;
      width: 100%;
      height: 280px;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }
  `]
})
export class SalesChartComponent implements OnChanges, AfterViewInit {
  @Input() dataPoints: DailySalesTrendPoint[] = [];
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    setTimeout(() => this.renderChart(), 50);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataPoints']) {
      setTimeout(() => this.renderChart(), 50);
    }
  }

  private renderChart(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };

    ctx.clearRect(0, 0, width, height);

    if (!this.dataPoints || this.dataPoints.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No trend data available for current selection', width / 2, height / 2);
      return;
    }

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const maxRev = Math.max(...this.dataPoints.map(p => p.revenue), 1000);

    // 1. Draw horizontal gridlines and Y-axis labels
    const gridLines = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (plotHeight / gridLines) * i;
      const val = maxRev - (maxRev / gridLines) * i;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText('$' + (val / 1000).toFixed(1) + 'k', padding.left - 8, y + 4);
    }

    // 2. Plot Revenue Area & Line Gradient
    const pointsCount = this.dataPoints.length;
    const getX = (index: number) => padding.left + (plotWidth / (pointsCount - 1 || 1)) * index;
    const getY = (val: number) => padding.top + plotHeight - (val / maxRev) * plotHeight;

    // Fill Area under curve
    const areaGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    areaGradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    areaGradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    ctx.beginPath();
    ctx.moveTo(getX(0), height - padding.bottom);
    for (let i = 0; i < pointsCount; i++) {
      ctx.lineTo(getX(i), getY(this.dataPoints[i].revenue));
    }
    ctx.lineTo(getX(pointsCount - 1), height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Line Path
    ctx.beginPath();
    for (let i = 0; i < pointsCount; i++) {
      const x = getX(i);
      const y = getY(this.dataPoints[i].revenue);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gross Profit Line
    ctx.beginPath();
    for (let i = 0; i < pointsCount; i++) {
      const x = getX(i);
      const y = getY(this.dataPoints[i].grossProfit);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw X-axis Date Labels (Sampled to avoid overlap)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';

    const step = Math.max(1, Math.floor(pointsCount / 6));
    for (let i = 0; i < pointsCount; i += step) {
      const rawDate = this.dataPoints[i].date;
      const dateObj = new Date(rawDate);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ctx.fillText(dateStr, getX(i), height - 12);
    }
  }
}
