import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FeeService } from '../../core/services/fee.service';
import { StudentFeeLedger } from '../../core/models/fee.model';

type ReportType = 'outstanding' | 'overdue' | 'paid';

@Component({
  selector: 'app-fee-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="page-shell">
      <header><p class="eyebrow">QSchool finance</p><h1>Fee reports</h1></header>
      <nav class="tabs"><button *ngFor="let item of reportTypes" type="button" [class.active]="type === item.value" (click)="select(item.value)">{{ item.label }}</button></nav>
      <p class="loading" *ngIf="loading">Loading report...</p><p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <div class="table-wrap" *ngIf="!loading && !errorMessage"><table><thead><tr><th>Student</th><th>Class</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Due date</th></tr></thead><tbody><tr *ngFor="let row of rows"><td>{{ row.studentId }}</td><td>{{ row.classId }}</td><td>{{ row.totalAmount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ row.paidAmount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ row.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ row.status }}</td><td>{{ row.dueDate }}</td></tr><tr *ngIf="!rows.length"><td colspan="7" class="empty">No fee records found.</td></tr></tbody></table></div>
    </section>
  `,
  styles: [`
    .page-shell { display: grid; gap: 18px; }.eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: .12em; color: #4f46e5; font-size: .72rem; font-weight: 700; }h1 { margin: 0; }.tabs { display: flex; gap: 8px; flex-wrap: wrap; }.tabs button { border: 0; border-radius: 10px; padding: 10px 14px; background: #eef2ff; color: #3730a3; font-weight: 700; cursor: pointer; }.tabs button.active { background: #4f46e5; color: white; }.table-wrap { overflow: auto; background: white; border-radius: 16px; }.table-wrap table { width: 100%; border-collapse: collapse; }.table-wrap th, .table-wrap td { text-align: left; padding: 13px; border-bottom: 1px solid #edf2f7; white-space: nowrap; }.table-wrap th { background: #f8fafc; }.loading, .empty { color: #64748b; }.error { color: #b91c1c; font-weight: 700; }
  `],
})
export class FeeReportsComponent implements OnInit {
  private readonly feeService = inject(FeeService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly reportTypes: { value: ReportType; label: string }[] = [{ value: 'outstanding', label: 'Outstanding' }, { value: 'overdue', label: 'Overdue' }, { value: 'paid', label: 'Paid' }];
  type: ReportType = 'outstanding';
  rows: StudentFeeLedger[] = [];
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void { this.load(); }
  select(type: ReportType): void { this.type = type; this.load(); }
  private load(): void {
    this.loading = true;
    this.errorMessage = null;
    this.feeService.getReports(this.type, 1, 40).subscribe({
      next: (response) => { this.rows = response.data; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => { this.rows = []; this.loading = false; this.errorMessage = err?.error?.message || err?.message || 'Unable to load fee report'; this.cdr.detectChanges(); },
    });
  }
}
