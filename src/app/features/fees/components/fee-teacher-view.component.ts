import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FeeService } from '../fees.service';
import { StudentFeeLedger } from '../fees.model';

@Component({
  selector: 'app-fee-teacher-view',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Class finance</p>
          <h1>Class fee status</h1>
          <p class="lede">Read-only view of fee payment status for your assigned class.</p>
        </div>
      </header>

      <form class="class-filter" (ngSubmit)="load()">
        <label>Assigned class ID<input [(ngModel)]="classId" name="classId" required placeholder="class-grade10" /></label>
        <button type="submit">View class fees</button>
      </form>

      <p class="loading" *ngIf="loading">Loading class fee summary...</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <section class="panel" *ngIf="!loading && loaded">
        <table *ngIf="ledger.length">
          <thead><tr><th>Student</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Due date</th></tr></thead>
          <tbody>
            <tr *ngFor="let entry of ledger">
              <!-- studentId shown raw: no teacher-safe "students in my class" endpoint exists to resolve a name -->
              <td>{{ entry.studentId }}</td>
              <td>{{ entry.totalAmount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td>{{ entry.paidAmount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td>{{ entry.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td>{{ entry.status }}</td>
              <td>{{ entry.dueDate }}</td>
            </tr>
          </tbody>
        </table>
        <p class="empty" *ngIf="!ledger.length">No fee records found for this class.</p>
      </section>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .lede { color: #64748b; margin: 0; }
      .class-filter { display: flex; align-items: end; gap: 12px; background: white; border: 1px solid #e6edf3; border-radius: 12px; padding: 16px; }
      .class-filter label { display: grid; gap: 6px; flex: 1; color: #334155; font-weight: 700; font-size: .84rem; }
      .class-filter input { border: 1px solid #dfe7f5; border-radius: 8px; padding: 10px 12px; font: inherit; }
      .class-filter button { border: 0; border-radius: 9px; padding: 10px 14px; background: #4f46e5; color: white; font-weight: 700; cursor: pointer; }
      .loading, .empty { color: #64748b; }
      .error { color: #b91c1c; font-weight: 700; }
      .panel { background: white; border-radius: 12px; padding: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); overflow: auto; }
      table { width: 100%; border-collapse: collapse; } th, td { text-align: left; padding: 10px; border-bottom: 1px solid #edf2f7; white-space: nowrap; }
    `,
  ],
})
export class FeeTeacherViewComponent {
  private readonly authService = inject(AuthService);
  private readonly feeService = inject(FeeService);
  private readonly cdr = inject(ChangeDetectorRef);

  classId = '';
  ledger: StudentFeeLedger[] = [];
  loading = false;
  loaded = false;
  errorMessage: string | null = null;

  load(): void {
    if (!this.classId.trim()) return;
    this.loading = true;
    this.errorMessage = null;
    this.feeService.getTeacherSummary(this.classId.trim(), undefined, 1, 40, this.authService.getTenantId() ?? '').subscribe({
      next: (response) => {
        this.ledger = response.data || [];
        this.loading = false;
        this.loaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Unable to load class fee summary.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
