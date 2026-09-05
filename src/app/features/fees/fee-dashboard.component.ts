import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeeReceipt, StudentFeeLedger } from '../../core/models/fee.model';
import { AuthService } from '../../core/services/auth.service';
import { FeeService } from '../../core/services/fee.service';
import { StudentService } from '../../core/services/student.service';

@Component({
  selector: 'app-fee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell" [class.admin-view]="isAdmin" [class.teacher-view]="isTeacher">
      <header class="page-header">
        <div>
          <p class="eyebrow">QSchool finance</p>
          <h1>{{ isAdmin ? 'Fee operations' : isTeacher ? 'Class fee view' : 'Family payments' }}</h1>
          <p class="lede">{{ isAdmin ? 'Keep collections, balances, and overdue accounts in one place.' : isTeacher ? 'A read-only view of payment status for your assigned class.' : 'A clear view of what is due, paid, and still outstanding.' }}</p>
        </div>
        <a *ngIf="isAdmin" class="accent-btn" routerLink="/admin/fees/manage">Manage fees</a>
      </header>

      <form *ngIf="isTeacher" class="class-filter" (ngSubmit)="loadTeacherSummary()">
        <label>Assigned class ID<input [(ngModel)]="teacherClassId" name="teacherClassId" required placeholder="class-grade10" /></label>
        <button class="accent-btn" type="submit">View class fees</button>
      </form>

      <div class="stats-grid">
        <article class="stat-card warm">
          <span>{{ isAdmin ? 'Total outstanding' : 'Outstanding balance' }}</span>
          <strong>{{ outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</strong>
          <small>{{ isAdmin ? 'Across all active ledgers' : 'Across current fee items' }}</small>
        </article>
        <article class="stat-card mint">
          <span>{{ isAdmin ? 'Collected this term' : 'Paid this term' }}</span>
          <strong>{{ collectedAmount | currency:'INR':'symbol':'1.0-0' }}</strong>
          <small>{{ isAdmin ? '70% of assigned fees' : 'Receipts are immutable' }}</small>
        </article>
        <article class="stat-card blue">
          <span>{{ isAdmin ? 'Overdue accounts' : 'Next due date' }}</span>
          <strong>{{ isAdmin ? overdueCount : nextDueDate }}</strong>
          <small>{{ isAdmin ? 'Needs follow-up' : 'Tuition instalment' }}</small>
        </article>
      </div>

      <div class="workspace-grid">
        <section class="panel ledger-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">{{ isAdmin ? 'Ledger health' : 'Fee ledger' }}</p>
              <h2>{{ isAdmin ? 'Recent collection activity' : 'Current academic year' }}</h2>
            </div>
            <a *ngIf="isAdmin" class="text-btn" routerLink="/admin/fees/reports">View reports</a>
          </div>

          <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="loading-text" *ngIf="isLoading">Loading live fee data...</p>
          <div class="ledger-list" *ngIf="!isLoading">
            <article class="ledger-row" *ngFor="let item of ledgerItems">
              <div class="ledger-icon">{{ item.icon }}</div>
              <div class="ledger-copy">
                <strong>{{ item.title }}</strong>
                <span>{{ item.detail }}</span>
              </div>
              <div class="ledger-amount">
                <strong>{{ item.amount }}</strong>
                <span [class]="'status ' + item.statusClass">{{ item.status }}</span>
              </div>
            </article>
            <p class="empty-text" *ngIf="!ledgerItems.length">No fee records found for this account.</p>
          </div>
        </section>

        <aside class="panel quick-panel">
          <p class="section-kicker">{{ isAdmin ? 'Admin tools' : isTeacher ? 'Class snapshot' : 'Payment guide' }}</p>
          <h2>{{ isAdmin ? 'Close the loop' : isTeacher ? '10-C overview' : 'Stay ahead of due dates' }}</h2>
          <p class="muted">{{ isAdmin ? 'Use reports to identify overdue balances and reconcile receipts.' : isTeacher ? 'Payment information is read-only for teachers.' : 'Receipts are permanent records. Your school office can help with corrections.' }}</p>
          <div class="progress-label"><span>Collection progress</span><strong>{{ isAdmin ? '70%' : '76%' }}</strong></div>
          <div class="progress-track"><span [style.width.%]="isAdmin ? 70 : 76"></span></div>
          <ul class="tool-list">
            <li *ngFor="let tool of tools"><span>{{ tool.mark }}</span>{{ tool.label }}</li>
          </ul>
        </aside>
      </div>

      <section class="panel" *ngIf="!isAdmin && !isTeacher && parentReceipts.length">
        <div class="panel-heading"><div><p class="section-kicker">Payment history</p><h2>Receipts</h2></div></div>
        <div class="receipt-list"><div class="receipt-row" *ngFor="let receipt of parentReceipts"><strong>{{ receipt.receiptNumber }}</strong><span>{{ receipt.receiptDate }}</span><b>{{ receipt.amountPaid | currency:'INR':'symbol':'1.0-0' }}</b></div></div>
      </section>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .page-shell { display: grid; gap: 24px; max-width: 1180px; margin: 0 auto; }
      .page-header { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
      .eyebrow, .section-kicker { margin: 0 0 7px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.7rem; color: #0f766e; font-weight: 800; }
      h1, h2, p { margin-top: 0; }
      h1 { margin-bottom: 9px; font-size: clamp(2rem, 4vw, 3.3rem); letter-spacing: -0.04em; color: #102a43; }
      h2 { margin-bottom: 0; color: #102a43; font-size: 1.25rem; }
      .lede { color: #62748a; max-width: 560px; margin-bottom: 0; line-height: 1.55; }
      .accent-btn, .text-btn { border: 0; cursor: pointer; font: inherit; font-weight: 800; text-decoration: none; }
      .accent-btn { background: #102a43; color: white; padding: 12px 16px; border-radius: 8px; white-space: nowrap; }
      .text-btn { background: transparent; color: #0f766e; padding: 4px 0; }
      .stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .stat-card { padding: 20px; border-radius: 12px; min-height: 142px; box-shadow: 0 12px 28px rgba(16,42,67,0.07); }
      .stat-card.warm { background: #fff4df; }.stat-card.mint { background: #e5f7ef; }.stat-card.blue { background: #e8f0fb; }
      .stat-card span, .stat-card small { display: block; color: #52657a; }.stat-card strong { display: block; margin: 14px 0 7px; color: #102a43; font-size: clamp(1.5rem, 3vw, 2.2rem); }.stat-card small { font-size: 0.78rem; }
      .workspace-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.8fr); gap: 18px; }
      .panel { background: white; border: 1px solid #e6edf3; border-radius: 12px; padding: 22px; box-shadow: 0 10px 24px rgba(16,42,67,0.05); }
      .panel-heading { display: flex; justify-content: space-between; gap: 16px; align-items: start; padding-bottom: 18px; border-bottom: 1px solid #edf1f5; }
      .ledger-list { display: grid; }.ledger-row { display: flex; align-items: center; gap: 12px; padding: 15px 0; border-bottom: 1px solid #edf1f5; }.ledger-row:last-child { border-bottom: 0; padding-bottom: 0; }.ledger-icon { width: 38px; height: 38px; border-radius: 9px; background: #edf7f4; color: #0f766e; display: grid; place-items: center; font-weight: 800; }.ledger-copy { min-width: 0; flex: 1; }.ledger-copy strong, .ledger-copy span, .ledger-amount strong, .ledger-amount span { display: block; }.ledger-copy span { color: #718096; font-size: 0.82rem; margin-top: 4px; }.ledger-amount { text-align: right; }.ledger-amount strong { color: #102a43; }.status { font-size: 0.72rem; font-weight: 800; margin-top: 5px; }.status.paid { color: #15803d; }.status.pending { color: #b45309; }.status.partial { color: #2563eb; }
      .quick-panel { background: #102a43; color: white; }.quick-panel h2 { color: white; }.quick-panel .section-kicker { color: #7dd3c7; }.muted { color: #bfd0df; line-height: 1.55; font-size: 0.9rem; }.progress-label { display: flex; justify-content: space-between; margin: 24px 0 8px; font-size: 0.82rem; color: #d8e4ee; }.progress-track { height: 8px; background: rgba(255,255,255,0.18); border-radius: 99px; overflow: hidden; }.progress-track span { display: block; height: 100%; background: #7dd3c7; border-radius: inherit; }.tool-list { list-style: none; padding: 0; margin: 24px 0 0; display: grid; gap: 12px; color: #e4eef5; font-size: 0.88rem; }.tool-list li { display: flex; align-items: center; gap: 9px; }.tool-list li span { color: #7dd3c7; font-weight: 800; }
      .class-filter { display: flex; align-items: end; gap: 12px; background: white; border: 1px solid #e6edf3; border-radius: 12px; padding: 16px; }.class-filter label { display: grid; gap: 6px; flex: 1; color: #334155; font-weight: 700; font-size: .84rem; }.class-filter input { border: 1px solid #dfe7f5; border-radius: 8px; padding: 10px 12px; font: inherit; }.receipt-list { display: grid; gap: 8px; }.receipt-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; padding: 12px 0; border-bottom: 1px solid #edf1f5; }.receipt-row span { color: #718096; }
      @media (max-width: 760px) { .page-header { align-items: start; flex-direction: column; }.stats-grid, .workspace-grid { grid-template-columns: 1fr; }.panel { padding: 18px; } }
    `,
  ],
})
export class FeeDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly feeService = inject(FeeService);
  private readonly studentService = inject(StudentService);
  private readonly cdr = inject(ChangeDetectorRef);
  isAdmin = false;
  isTeacher = false;
  teacherClassId = '';
  isLoading = true;
  errorMessage: string | null = null;
  outstandingAmount = 0;
  collectedAmount = 0;
  overdueCount = 0;
  nextDueDate = '-';
  parentReceipts: FeeReceipt[] = [];

  ledgerItems: { icon: string; title: string; detail: string; amount: number; status: string; statusClass: string }[] = [];

  readonly tools = [
    { mark: '✓', label: 'Ledger entries stay tied to the academic year' },
    { mark: '✓', label: 'Receipts remain immutable after payment' },
    { mark: '✓', label: 'Overdue balances are easy to spot' },
  ];

  ngOnInit(): void {
    const roles = this.authService.getRoles();
    this.isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPERADMIN');
    this.isTeacher = roles.includes('ROLE_TEACHER');
    this.loadFeeData();
  }

  private loadFeeData(): void {
    const tenantId = this.authService.getTenantId() ?? '';
    if (this.isAdmin) {
      this.feeService.getDashboard(tenantId).subscribe({
        next: (response) => {
          const dashboard = response.data;
          this.outstandingAmount = dashboard?.totalOutstanding ?? 0;
          this.collectedAmount = dashboard?.totalCollected ?? 0;
          this.overdueCount = dashboard?.overdueCount ?? 0;
          this.ledgerItems = (dashboard?.recentReceipts ?? []).map((receipt) => this.receiptItem(receipt));
          this.finishLoading();
        },
        error: (err) => this.failLoading(err),
      });
      return;
    }

    if (this.isTeacher) {
      this.isLoading = false;
      this.errorMessage = null;
      this.cdr.detectChanges();
      return;
    }

    this.studentService.getMyStudents(tenantId, 1, 1).subscribe({
      next: (response) => {
        const student = response.data?.[0];
        if (!student) {
          this.failLoading({ message: 'No child is linked to this parent account.' });
          return;
        }
        this.feeService.getParentSummary(student.id, undefined, 1, 20, tenantId).subscribe({
          next: (summary) => {
            this.ledgerItems = summary.data.map((entry) => this.ledgerItem(entry));
            this.setTotals(summary.data);
            this.feeService.getParentReceipts(student.id, 1, 20, tenantId).subscribe({
              next: (receipts) => { this.parentReceipts = receipts.data; this.cdr.detectChanges(); },
              error: () => { this.parentReceipts = []; this.cdr.detectChanges(); },
            });
            this.finishLoading();
          },
          error: (err) => this.failLoading(err),
        });
      },
      error: (err) => this.failLoading(err),
    });
  }

  loadTeacherSummary(): void {
    if (!this.teacherClassId.trim()) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.feeService.getTeacherSummary(this.teacherClassId.trim(), undefined, 1, 40, this.authService.getTenantId() ?? '').subscribe({
      next: (response) => {
        this.ledgerItems = response.data.map((entry) => this.ledgerItem(entry));
        this.setTotals(response.data);
        this.finishLoading();
      },
      error: (err) => this.failLoading(err),
    });
  }

  private setTotals(entries: StudentFeeLedger[]): void {
    this.outstandingAmount = entries.reduce((total, entry) => total + (entry.outstandingAmount || 0), 0);
    this.collectedAmount = entries.reduce((total, entry) => total + (entry.paidAmount || 0), 0);
    const next = entries.find((entry) => entry.outstandingAmount > 0 && entry.dueDate);
    this.nextDueDate = next?.dueDate ?? '-';
  }

  private ledgerItem(entry: StudentFeeLedger) {
    return {
      icon: 'F',
      title: `Fee ledger · ${entry.status}`,
      detail: `Due ${entry.dueDate || '-'} · ${entry.studentId}`,
      amount: entry.outstandingAmount || 0,
      status: entry.status,
      statusClass: entry.status.toLowerCase(),
    };
  }

  private receiptItem(receipt: FeeReceipt) {
    return {
      icon: 'R',
      title: receipt.receiptNumber,
      detail: `Paid ${receipt.receiptDate}${receipt.studentId ? ` · ${receipt.studentId}` : ''}`,
      amount: receipt.amountPaid || 0,
      status: 'Paid',
      statusClass: 'paid',
    };
  }

  private finishLoading(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private failLoading(err: { error?: { message?: string }; message?: string }): void {
    this.isLoading = false;
    this.errorMessage = err?.error?.message || err?.message || 'Unable to load fee data';
    this.cdr.detectChanges();
  }
}
