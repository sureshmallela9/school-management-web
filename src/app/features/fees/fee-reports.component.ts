import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeeService } from '../../core/services/fee.service';
import { AuthService } from '../../core/services/auth.service';
import { StudentFeeLedger } from '../../core/models/fee.model';

type FeeReportType = 'paid' | 'outstanding' | 'overdue';

@Component({
  selector: 'app-fee-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">QSchool finance</p>
          <h1>Fee reports</h1>
          <p class="lede">Review live ledger balances and follow up on accounts that need attention.</p>
        </div>
        <a class="ghost-link" routerLink="/admin/fees">Back to fee operations</a>
      </header>

      <nav class="report-tabs" aria-label="Fee reports">
        <button *ngFor="let option of reportOptions" type="button" [class.active]="reportType === option.value" (click)="selectReport(option.value)">
          {{ option.label }}
        </button>
      </nav>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">{{ currentLabel }}</p>
            <h2>{{ reportRows.length }} ledger entries</h2>
          </div>
          <button type="button" class="primary-btn" (click)="loadReport()">Refresh</button>
        </div>

        <p class="loading-text" *ngIf="isLoading">Loading report...</p>
        <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>
        <div class="table-wrap" *ngIf="!isLoading && !errorMessage">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of reportRows">
                <td>{{ row.studentId }}</td>
                <td>{{ row.classId || '-' }}</td>
                <td>{{ row.totalAmount | currency:'INR':'symbol':'1.0-0' }}</td>
                <td>{{ row.paidAmount | currency:'INR':'symbol':'1.0-0' }}</td>
                <td>{{ row.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</td>
                <td><span class="status" [class]="row.status.toLowerCase()">{{ row.status }}</span></td>
                <td>{{ row.dueDate || '-' }}</td>
              </tr>
              <tr *ngIf="!reportRows.length">
                <td colspan="7" class="empty-cell">No entries found for this report.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page-shell { display: grid; gap: 20px; max-width: 1180px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: end; gap: 20px; }
    .eyebrow, .section-kicker { margin: 0 0 7px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.7rem; color: #0f766e; font-weight: 800; }
    h1, h2 { color: #102a43; margin: 0; } h1 { font-size: clamp(2rem, 4vw, 3.2rem); letter-spacing: -0.04em; margin-bottom: 8px; } h2 { font-size: 1.25rem; }
    .lede { color: #62748a; margin: 0; line-height: 1.5; }.ghost-link { color: #0f766e; font-weight: 800; text-decoration: none; white-space: nowrap; }
    .report-tabs { display: flex; gap: 8px; flex-wrap: wrap; }.report-tabs button, .primary-btn { border: 0; border-radius: 8px; padding: 11px 14px; font: inherit; font-weight: 800; cursor: pointer; }.report-tabs button { background: #e8f0f5; color: #52657a; }.report-tabs button.active { background: #102a43; color: white; }.primary-btn { background: #0f766e; color: white; }
    .panel { background: white; border: 1px solid #e6edf3; border-radius: 12px; padding: 22px; box-shadow: 0 10px 24px rgba(16,42,67,0.05); }.panel-heading { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 18px; }
    .table-wrap { overflow-x: auto; } table { width: 100%; border-collapse: collapse; } th, td { padding: 14px 12px; border-bottom: 1px solid #edf1f5; text-align: left; white-space: nowrap; } th { background: #f7fafc; color: #52657a; font-size: 0.8rem; }.status { font-size: 0.75rem; font-weight: 800; }.status.paid { color: #15803d; }.status.partial { color: #2563eb; }.status.pending { color: #b45309; }.empty-cell { text-align: center; color: #62748a; padding: 28px; }.loading-text { color: #62748a; }.error-text { color: #b91c1c; font-weight: 700; }
    @media (max-width: 680px) { .page-header { align-items: start; flex-direction: column; }.panel { padding: 16px; } }
  `],
})
export class FeeReportsComponent implements OnInit {
  private readonly feeService = inject(FeeService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly reportOptions: { value: FeeReportType; label: string }[] = [
    { value: 'outstanding', label: 'Outstanding' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'paid', label: 'Paid' },
  ];
  reportType: FeeReportType = 'outstanding';
  reportRows: StudentFeeLedger[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  get currentLabel(): string {
    return this.reportOptions.find((option) => option.value === this.reportType)?.label ?? 'Fee report';
  }

  ngOnInit(): void {
    this.loadReport();
  }

  selectReport(type: FeeReportType): void {
    this.reportType = type;
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.feeService.getAdminFeeReport(this.reportType, {}, 1, 40, this.authService.getTenantId() ?? '').subscribe({
      next: (response) => {
        this.reportRows = response.data ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.reportRows = [];
        this.errorMessage = err?.error?.message || err?.message || 'Unable to load fee report';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
