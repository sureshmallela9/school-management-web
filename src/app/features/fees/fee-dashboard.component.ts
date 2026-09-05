import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeeService } from '../../core/services/fee.service';
import { FeeDashboard } from '../../core/models/fee.model';

@Component({
  selector: 'app-fee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">QSchool finance</p>
          <h1>Fee dashboard</h1>
        </div>
        <div class="fee-links"><a class="reports-link" routerLink="/admin/fees/categories">Categories</a><a class="reports-link" routerLink="/admin/fees/reports">View reports</a></div>
      </header>

      <p class="loading" *ngIf="loading">Loading fee data...</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <div class="card-grid" *ngIf="dashboard">
        <article class="stat-card">
          <span>Total assigned</span>
          <strong>{{ dashboard.totalAssigned | currency:'INR':'symbol':'1.0-0' }}</strong>
        </article>
        <article class="stat-card">
          <span>Collected</span>
          <strong>{{ dashboard.totalCollected | currency:'INR':'symbol':'1.0-0' }}</strong>
        </article>
        <article class="stat-card">
          <span>Outstanding</span>
          <strong>{{ dashboard.totalOutstanding | currency:'INR':'symbol':'1.0-0' }}</strong>
        </article>
        <article class="stat-card">
          <span>Overdue accounts</span>
          <strong>{{ dashboard.overdueCount }}</strong>
        </article>
      </div>

      <section class="recent-panel" *ngIf="dashboard">
        <h2>Recent receipts</h2>
        <div class="receipt-row" *ngFor="let receipt of dashboard.recentReceipts">
          <strong>{{ receipt.receiptNumber }}</strong><span>{{ receipt.receiptDate }}</span><b>{{ receipt.amountPaid | currency:'INR':'symbol':'1.0-0' }}</b>
        </div>
        <p *ngIf="!dashboard.recentReceipts.length" class="empty">No receipts found.</p>
      </section>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .page-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
      .fee-links { display:flex; gap:14px; }.reports-link { color: #4f46e5; font-weight: 700; text-decoration: none; }
      .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
      .stat-card { background: white; padding: 18px; border-radius: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); }
      .stat-card span { display: block; color: #64748b; margin-bottom: 12px; }
      .stat-card strong { font-size: 2rem; }
      .recent-panel { background: white; padding: 18px; border-radius: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); }.recent-panel h2 { margin: 0 0 12px; }.receipt-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; padding: 12px 0; border-bottom: 1px solid #edf2f7; }.receipt-row span { color: #64748b; }.empty, .loading { color: #64748b; }.error { color: #b91c1c; font-weight: 700; }
    `,
  ],
})
export class FeeDashboardComponent implements OnInit {
  private readonly feeService = inject(FeeService);
  private readonly cdr = inject(ChangeDetectorRef);
  dashboard: FeeDashboard | null = null;
  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.feeService.getDashboard().subscribe({
      next: (response) => { this.dashboard = response.data; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => { this.loading = false; this.errorMessage = err?.error?.message || err?.message || 'Unable to load fee dashboard'; this.cdr.detectChanges(); },
    });
  }
}
