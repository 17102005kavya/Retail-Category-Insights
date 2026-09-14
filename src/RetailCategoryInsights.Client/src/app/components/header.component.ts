import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="dashboard-header glass-card">
      <div class="header-brand">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/>
            <path d="M18 9l-5 5-4-4-3 3"/>
          </svg>
        </div>
        <div>
          <h1 class="brand-title">Retail Category Insights</h1>
          <p class="brand-subtitle">Real-Time Performance, Stockout Risk & AI Analytics</p>
        </div>
      </div>

      <div class="header-actions">
        <div class="api-status-badge">
          <span class="status-dot"></span>
          <span>API: Connected</span>
        </div>

        <button *ngIf="!username" (click)="openAuth.emit()" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          JWT Login
        </button>

        <div *ngIf="username" class="user-pill">
          <span class="avatar">{{ username.charAt(0).toUpperCase() }}</span>
          <span class="user-name">{{ username }}</span>
          <button (click)="logout.emit()" class="btn-logout" title="Sign out">&times;</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      margin-bottom: 24px;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .brand-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
    }
    .brand-subtitle {
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .api-status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 9999px;
      font-size: 0.78rem;
      color: #34d399;
      font-weight: 600;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-color);
      padding: 4px 12px 4px 4px;
      border-radius: 9999px;
    }
    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .btn-logout {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.1rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
    }
    .btn-logout:hover {
      color: var(--accent-rose);
    }
  `]
})
export class HeaderComponent {
  @Input() username: string | null = null;
  @Output() openAuth = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
