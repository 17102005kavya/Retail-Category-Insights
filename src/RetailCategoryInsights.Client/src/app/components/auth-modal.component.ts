import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card glass-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">JWT Authorization</h3>
          <button (click)="close.emit()" class="close-btn">&times;</button>
        </div>

        <form (ngSubmit)="onSubmit()" class="modal-form">
          <p class="form-subtext">Enter credentials to issue a secure JWT bearer token for API access.</p>

          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" [(ngModel)]="username" name="username" required placeholder="admin" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="password" class="form-input" />
          </div>

          <div class="demo-hint">
            💡 Quick Demo Credentials: <code>admin</code> / <code>password</code>
          </div>

          <div class="modal-actions">
            <button type="button" (click)="close.emit()" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Authenticate & Get Token</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-card {
      width: 90%;
      max-width: 420px;
      padding: 24px;
      background: #1e293b;
      border: 1px solid var(--border-color);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .modal-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
    }
    .form-subtext {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .form-input {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
    }
    .demo-hint {
      font-size: 0.8rem;
      color: var(--accent-amber);
      background: rgba(245, 158, 11, 0.1);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      margin-bottom: 20px;
    }
    .demo-hint code {
      font-family: monospace;
      font-weight: 700;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      border: none;
      padding: 10px 16px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 600;
    }
  `]
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() login = new EventEmitter<{ username: string; password: string }>();

  username = 'admin';
  password = 'password';

  onSubmit(): void {
    if (this.username && this.password) {
      this.login.emit({ username: this.username, password: this.password });
    }
  }
}
