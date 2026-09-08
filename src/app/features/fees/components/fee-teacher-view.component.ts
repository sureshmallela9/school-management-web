import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherContextService } from '../../../core/services/teacher-context.service';
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
        <label>Assigned class ID<input [(ngModel)]="classId" name="classId" list="knownClassIds" required placeholder="class-grade10" /></label>
        <datalist id="knownClassIds"><option *ngFor="let id of teacherContext.classIds()" [value]="id"></option></datalist>
        <button type="submit">View class fees</button>
      </form>

      <div class="known-ids">
        <p class="loading" *ngIf="!teacherContext.classIds().length">No class IDs known yet - there is no "list my classes" endpoint on this backend, so add the class IDs your school gave you below.</p>
        <div class="known-ids-row">
          <input type="text" #newClassIdInput placeholder="Add a class ID you teach" (keyup.enter)="addKnownClass(newClassIdInput.value); newClassIdInput.value = ''" />
          <button type="button" (click)="addKnownClass(newClassIdInput.value); newClassIdInput.value = ''">Add</button>
        </div>
        <div class="chip-row" *ngIf="teacherContext.classIds().length">
          <span class="chip" *ngFor="let id of teacherContext.classIds()">{{ id }}<button type="button" (click)="teacherContext.forgetClass(id)" aria-label="Remove">×</button></span>
        </div>
      </div>

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
      .known-ids { display: grid; gap: 8px; }
      .known-ids-row { display: flex; gap: 8px; }
      .known-ids-row input { flex: 1; border: 1px solid #dfe7f5; border-radius: 8px; padding: 8px 10px; font: inherit; }
      .known-ids-row button { border: 0; border-radius: 8px; padding: 8px 12px; background: #4f46e5; color: white; font-weight: 700; cursor: pointer; }
      .chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .chip { display: inline-flex; align-items: center; gap: 6px; background: #eef2ff; color: #3730a3; padding: 5px 6px 5px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }
      .chip button { border: none; background: transparent; color: inherit; cursor: pointer; font-weight: 800; padding: 0 4px; }
    `,
  ],
})
export class FeeTeacherViewComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly feeService = inject(FeeService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly teacherContext = inject(TeacherContextService);

  classId = '';
  ledger: StudentFeeLedger[] = [];
  loading = false;
  loaded = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.teacherContext.refresh();
  }

  addKnownClass(value: string): void {
    if (!value.trim()) return;
    this.teacherContext.rememberClass(value.trim());
  }

  // re-runs whenever a new class is remembered (e.g. right after the background refresh() resolves),
  // auto-filling the field the first time we learn a class this teacher is actually assigned to
  private readonly autoSelectClass = effect(() => {
    const [firstKnownClass] = this.teacherContext.classIds();
    if (firstKnownClass && !this.classId) {
      this.classId = firstKnownClass;
      this.load();
    }
  });

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
