import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { StudentService } from '../../../core/services/student.service';
import { Student } from '../../../core/models/student.model';
import { FeeService } from '../fees.service';
import { FeeReceipt, LegacyFee, StudentFeeLedger } from '../fees.model';

@Component({
  selector: 'app-fee-parent-view',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Family finance</p>
          <h1>My fees</h1>
          <p class="lede">Track outstanding balances, upcoming due dates, and past receipts for each child.</p>
        </div>
      </header>

      <label class="child-picker" *ngIf="children.length > 1">
        <span>Child</span>
        <select [(ngModel)]="selectedStudentId" (ngModelChange)="loadForSelectedChild()">
          <option *ngFor="let child of children" [value]="child.id">{{ child.name }}</option>
        </select>
      </label>

      <p class="loading" *ngIf="loading">Loading fee details...</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <div class="stats-grid" *ngIf="!loading && !errorMessage">
        <article class="stat-card warm">
          <span>Outstanding balance</span>
          <strong>{{ outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</strong>
        </article>
        <article class="stat-card mint">
          <span>Paid so far</span>
          <strong>{{ paidAmount | currency:'INR':'symbol':'1.0-0' }}</strong>
        </article>
        <article class="stat-card blue">
          <span>Next due date</span>
          <strong>{{ nextDueDate }}</strong>
        </article>
      </div>

      <section class="panel" *ngIf="!loading">
        <h2>Fee ledger</h2>
        <table *ngIf="ledger.length">
          <thead><tr><th>Status</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Due date</th></tr></thead>
          <tbody>
            <tr *ngFor="let entry of ledger">
              <td><span class="status" [class]="entry.status.toLowerCase()">{{ entry.status }}</span></td>
              <td>{{ entry.totalAmount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td>{{ entry.paidAmount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td>{{ entry.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td>{{ entry.dueDate }}</td>
            </tr>
          </tbody>
        </table>
        <p class="empty" *ngIf="!ledger.length">No fee ledger entries found for this child.</p>
      </section>

      <section class="panel" *ngIf="!loading">
        <h2>Receipts</h2>
        <div class="receipt-row" *ngFor="let receipt of receipts">
          <strong>{{ receipt.receiptNumber }}</strong><span>{{ receipt.receiptDate }}</span><b>{{ receipt.amountPaid | currency:'INR':'symbol':'1.0-0' }}</b>
        </div>
        <p class="empty" *ngIf="!receipts.length">No receipts recorded yet.</p>
      </section>

      <section class="panel" *ngIf="!loading && legacyFees.length">
        <h2>Other fees</h2>
        <table>
          <thead><tr><th>Type</th><th>Amount</th><th>Due date</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let fee of legacyFees">
              <td>{{ fee.feeType }}</td>
              <td>{{ fee.amount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td>{{ fee.dueDate }}</td>
              <td>{{ fee.status }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .lede { color: #64748b; margin: 0; }
      .child-picker { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #334155; }
      .child-picker select { border: 1px solid #dfe7f5; border-radius: 8px; padding: 8px 10px; font: inherit; }
      .loading, .empty { color: #64748b; }
      .error { color: #b91c1c; font-weight: 700; }
      .stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .stat-card { padding: 20px; border-radius: 12px; box-shadow: 0 12px 28px rgba(16,42,67,0.07); }
      .stat-card.warm { background: #fff4df; } .stat-card.mint { background: #e5f7ef; } .stat-card.blue { background: #e8f0fb; }
      .stat-card span { display: block; color: #52657a; } .stat-card strong { display: block; margin-top: 10px; font-size: 1.6rem; color: #102a43; }
      .panel { background: white; border-radius: 12px; padding: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); }
      table { width: 100%; border-collapse: collapse; } th, td { text-align: left; padding: 10px; border-bottom: 1px solid #edf2f7; }
      .status { font-weight: 700; font-size: 0.78rem; } .status.paid { color: #15803d; } .status.pending { color: #b45309; } .status.partial { color: #2563eb; }
      .receipt-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; padding: 10px 0; border-bottom: 1px solid #edf1f5; }
      @media (max-width: 700px) { .stats-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class FeeParentViewComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly studentService = inject(StudentService);
  private readonly feeService = inject(FeeService);
  private readonly cdr = inject(ChangeDetectorRef);

  children: Student[] = [];
  selectedStudentId = '';
  ledger: StudentFeeLedger[] = [];
  receipts: FeeReceipt[] = [];
  legacyFees: LegacyFee[] = [];
  outstandingAmount = 0;
  paidAmount = 0;
  nextDueDate = '-';
  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const tenantId = this.authService.getTenantId() ?? '';
    this.studentService.getMyStudents(tenantId, 1, 50).subscribe({
      next: (response) => {
        this.children = response.data || [];
        this.selectedStudentId = this.children[0]?.id ?? '';
        if (!this.selectedStudentId) {
          this.errorMessage = 'No child is linked to this parent account.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        this.loadForSelectedChild();
      },
      error: (err) => this.fail(err),
    });
  }

  loadForSelectedChild(): void {
    if (!this.selectedStudentId) return;
    this.loading = true;
    this.errorMessage = null;
    const tenantId = this.authService.getTenantId() ?? '';

    this.feeService.getParentSummary(this.selectedStudentId, undefined, 1, 20, tenantId).subscribe({
      next: (summary) => {
        this.ledger = summary.data || [];
        this.outstandingAmount = this.ledger.reduce((sum, e) => sum + (e.outstandingAmount || 0), 0);
        this.paidAmount = this.ledger.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
        const next = this.ledger.find((e) => e.outstandingAmount > 0 && e.dueDate);
        this.nextDueDate = next?.dueDate ?? '-';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => this.fail(err),
    });

    this.feeService.getParentReceipts(this.selectedStudentId, 1, 20, tenantId).subscribe({
      next: (response) => { this.receipts = response.data || []; this.cdr.detectChanges(); },
      error: () => { this.receipts = []; this.cdr.detectChanges(); },
    });

    this.feeService.getParentLegacyFees(this.selectedStudentId, tenantId).subscribe({
      next: (response) => { this.legacyFees = response.data || []; this.cdr.detectChanges(); },
      error: () => { this.legacyFees = []; this.cdr.detectChanges(); },
    });
  }

  private fail(err: { error?: { message?: string }; message?: string }): void {
    this.errorMessage = err?.error?.message || err?.message || 'Unable to load fee data.';
    this.loading = false;
    this.cdr.detectChanges();
  }
}
