import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="login-shell">
      <div class="login-card">
        <div class="brand-block">
          <div class="brand-badge">QS</div>
          <h1>QSchool</h1>
          <p>Secure, mobile-first school operations dashboard.</p>
        </div>

        <form class="login-form" (ngSubmit)="login()">
          <label>
            <span>Email</span>
            <input type="email" [(ngModel)]="email" name="email" placeholder="parent@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          </label>

          <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>

          <button type="submit" class="primary-btn" [disabled]="isSubmitting">{{ isSubmitting ? 'Signing in...' : 'Sign in' }}</button>

          <div class="demo-row">
            <button type="button" class="ghost-btn" (click)="quickLogin('jane.parent@school.com')">Parent</button>
            <button type="button" class="ghost-btn" (click)="quickLogin('jane.doe@northwood.com')">Teacher</button>
            <button type="button" class="ghost-btn" (click)="quickLogin('admin@central.com')">Admin</button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: linear-gradient(135deg, #eef4ff 0%, #f5f7ff 100%);
      }

      .login-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }

      .login-card {
        width: min(100%, 440px);
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(130, 145, 187, 0.2);
        border-radius: 24px;
        box-shadow: 0 24px 50px rgba(32, 45, 80, 0.12);
        padding: 32px 28px;
      }

      .brand-block {
        text-align: center;
        margin-bottom: 24px;
      }

      .brand-badge {
        width: 68px;
        height: 68px;
        margin: 0 auto 16px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        font-size: 1.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: white;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 2rem;
      }

      p {
        margin: 0;
        color: #5f6b85;
      }

      .login-form {
        display: grid;
        gap: 18px;
      }

      label {
        display: grid;
        gap: 8px;
        color: #24314d;
        font-weight: 600;
      }

      input {
        width: 100%;
        border: 1px solid #dfe5f3;
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 0.98rem;
        background: white;
      }

      .primary-btn,
      .ghost-btn {
        border: none;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }

      .primary-btn {
        padding: 14px 16px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: white;
      }

      .ghost-btn {
        background: #edf2ff;
        color: #1d2f59;
        padding: 10px 12px;
      }

      .primary-btn:hover,
      .ghost-btn:hover {
        transform: translateY(-1px);
      }

      .demo-row {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .error-text {
        color: #b91c1c;
        font-weight: 600;
        margin: 0;
      }
    `,
  ],
})
export class LoginComponent {
  email = 'admin@central.com';
  password = 'password123';
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  login(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const roles = this.authService.getRoles();
        const target = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPERADMIN')
          ? '/admin'
          : roles.includes('ROLE_TEACHER')
            ? '/teacher'
            : '/app/home';
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || err?.message || 'Invalid email or password';
        this.cdr.detectChanges();
      },
    });
  }

  quickLogin(email: string): void {
    this.email = email;
    this.password = 'password123';
    this.login();
  }
}
