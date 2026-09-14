import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiInsight } from '../models/retail.models';

@Component({
  selector: 'app-ai-insight',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="insight-card glass-card">
      <div class="insight-header">
        <div class="header-title-box">
          <div class="sparkle-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4z"/>
            </svg>
          </div>
          <div>
            <h3 class="card-title">AI Category Analyst & Merchandising Insights</h3>
            <p class="card-subtitle">LLM Generative Strategic Summary for {{ categoryName }}</p>
          </div>
        </div>

        <button (click)="generate.emit(customPrompt)" [disabled]="isLoading" class="btn-primary">
          <svg *ngIf="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24"/>
            <polyline points="21 3 21 9 15 9"/>
          </svg>
          <span *ngIf="isLoading" class="spinner"></span>
          {{ isLoading ? 'Generating AI Insight...' : 'Generate AI Summary' }}
        </button>
      </div>

      <!-- Custom Prompt Input -->
      <div class="prompt-bar">
        <input 
          type="text" 
          [(ngModel)]="customPrompt" 
          placeholder="Optional: Ask AI specific focus (e.g. 'Evaluate Q4 promo strategy' or 'Margin optimization')..." 
          class="prompt-input"
        />
      </div>

      <!-- Content Container -->
      <div *ngIf="insight" class="insight-body animate-fade-in">
        <div class="summary-box">
          <div class="summary-meta">
            <span class="badge badge-indigo">{{ insight.modelUsed }}</span>
            <span class="badge badge-emerald">Confidence: {{ (insight.confidenceScore * 100) | number:'1.0-0' }}%</span>
          </div>
          <p class="summary-text">{{ insight.summary }}</p>
        </div>

        <div class="grid-sections">
          <!-- Key Highlights -->
          <div class="section-column">
            <h4 class="section-heading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Key Performance Takeaways
            </h4>
            <ul class="bullet-list">
              <li *ngFor="let h of insight.keyHighlights" class="bullet-item">
                <span class="bullet-dot emerald"></span>
                <span>{{ h }}</span>
              </li>
            </ul>
          </div>

          <!-- Recommendations -->
          <div class="section-column">
            <h4 class="section-heading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Actionable Recommendations
            </h4>
            <ul class="bullet-list">
              <li *ngFor="let r of insight.actionableRecommendations" class="bullet-item">
                <span class="bullet-dot indigo"></span>
                <span>{{ r }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .insight-card {
      padding: 24px;
      margin-bottom: 24px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .header-title-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sparkle-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }
    .card-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .prompt-bar {
      margin-bottom: 20px;
    }
    .prompt-input {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: #fff;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .prompt-input:focus {
      border-color: var(--primary);
    }

    .summary-box {
      background: rgba(15, 23, 42, 0.5);
      border-left: 4px solid var(--primary);
      border-radius: var(--radius-sm);
      padding: 16px 20px;
      margin-bottom: 20px;
    }
    .summary-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }
    .summary-text {
      font-size: 0.95rem;
      color: #f1f5f9;
      line-height: 1.6;
    }

    .grid-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .section-heading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
    }
    .bullet-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .bullet-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }
    .bullet-dot.emerald { background: #10b981; }
    .bullet-dot.indigo { background: #6366f1; }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AiInsightComponent {
  @Input() insight: AiInsight | null = null;
  @Input() categoryName = 'Category';
  @Input() isLoading = false;
  @Output() generate = new EventEmitter<string | undefined>();
  customPrompt = '';
}
