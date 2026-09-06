import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherContextService } from '../../../core/services/teacher-context.service';
import { AttendanceService } from '../attendance.service';
import { AttendanceRecord } from '../attendance.model';

@Component({
  selector: 'app-teacher-student-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>Student History</h1>
        </div>
      </div>

      <div class="filter-row">
        <label>
          <span>Student ID</span>
          <input type="text" list="knownStudentIds" [(ngModel)]="studentId" placeholder="student-1" />
          <datalist id="knownStudentIds"><option *ngFor="let id of teacherContext.studentIdsFor(null)" [value]="id"></option></datalist>
        </label>
        <label>
          <span>From date</span>
          <input type="date" [(ngModel)]="fromDate" />
        </label>
        <label>
          <span>To date</span>
          <input type="date" [(ngModel)]="toDate" />
        </label>
        <button type="button" class="primary-btn" (click)="search()">Search</button>
      </div>

      <div class="known-ids">
        <p class="hint" *ngIf="!teacherContext.studentIdsFor(null).length">No student IDs known yet - there is no "list my students" endpoint on this backend, so add the student IDs your school gave you below.</p>
        <div class="known-ids-row">
          <input type="text" #newStudentIdInput placeholder="Add a student ID" (keyup.enter)="addKnownStudent(newStudentIdInput.value); newStudentIdInput.value = ''" />
          <button type="button" class="primary-btn" (click)="addKnownStudent(newStudentIdInput.value); newStudentIdInput.value = ''">Add</button>
        </div>
        <div class="chip-row" *ngIf="teacherContext.studentIdsFor(null).length">
          <span class="chip" *ngFor="let id of teacherContext.studentIdsFor(null)">{{ id }}<button type="button" (click)="teacherContext.forgetStudent(null, id)" aria-label="Remove">×</button></span>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Class</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of records">
              <td>{{ record.attendanceDate }}</td>
              <td>{{ record.className || record.classId }}</td>
              <td>{{ record.attendanceType }}</td>
              <td>{{ record.remarks || '-' }}</td>
            </tr>
            <tr *ngIf="!records.length">
              <td colspan="4" class="empty-cell">Search a student ID to view attendance history.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button type="button" [disabled]="page === 1" (click)="changePage(page - 1)">Previous</button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button type="button" [disabled]="page === totalPages" (click)="changePage(page + 1)">Next</button>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .filter-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; align-items: end; background: white; border-radius: 16px; padding: 14px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      .filter-row label { display: grid; gap: 6px; font-weight: 600; color: #334155; font-size: 0.85rem; }
      .filter-row input { border: 1px solid #dfe7f5; border-radius: 10px; padding: 10px 12px; font: inherit; }
      .primary-btn { border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .table-wrap { overflow: auto; background: white; border-radius: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 14px 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
      th { background: #f8fafc; }
      tbody tr { transition: background 0.15s ease; }
      tbody tr:hover { background: #f8fafc; }
      .empty-cell { text-align: center; color: #64748b; padding: 24px; }
      .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; background: white; padding: 12px; border-radius: 12px; }
      .pagination button { border: none; border-radius: 10px; background: #e2e8f0; padding: 8px 12px; font-weight: 700; cursor: pointer; }
      .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
      .hint { margin: 0; background: #fef9c3; color: #854d0e; padding: 12px 14px; border-radius: 10px; font-weight: 600; }
      .known-ids { display: grid; gap: 8px; }
      .known-ids-row { display: flex; gap: 8px; }
      .known-ids-row input { flex: 1; border: 1px solid #dfe7f5; border-radius: 10px; padding: 8px 10px; font: inherit; }
      .chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .chip { display: inline-flex; align-items: center; gap: 6px; background: #eef2ff; color: #3730a3; padding: 5px 6px 5px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }
      .chip button { border: none; background: transparent; color: inherit; cursor: pointer; font-weight: 800; padding: 0 4px; }
    `,
  ],
})
export class TeacherStudentHistoryComponent {
  readonly teacherContext = inject(TeacherContextService);

  studentId = '';
  fromDate = '';
  toDate = '';
  records: AttendanceRecord[] = [];
  page = 1;
  limit = 20;
  totalPages = 1;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.teacherContext.refresh();
  }

  changePage(nextPage: number): void {
    this.page = nextPage;
    this.search();
  }

  addKnownStudent(value: string): void {
    if (!value.trim()) return;
    this.teacherContext.rememberStudent(null, value.trim());
  }

  search(): void {
    if (!this.studentId) {
      this.records = [];
      return;
    }

    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getStudentHistory(this.studentId, tenantId, this.fromDate || undefined, this.toDate || undefined, this.page, this.limit).subscribe({
      next: (response) => {
        this.records = response.data;
        this.totalPages = response.totalPages;
        this.teacherContext.rememberStudent(null, this.studentId);
        this.cdr.detectChanges();
      },
      error: () => {
        this.records = [];
        this.cdr.detectChanges();
      },
    });
  }
}
