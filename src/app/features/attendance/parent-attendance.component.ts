import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { StudentService } from '../../core/services/student.service';
import { AttendanceRecord, AttendanceSummary, YearlySummary } from '../../core/models/attendance.model';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-parent-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>My Child's Attendance</h1>
        </div>
        <label class="child-picker" *ngIf="children.length > 1">
          <span>Child</span>
          <select [(ngModel)]="selectedStudentId" (ngModelChange)="onChildChange()">
            <option *ngFor="let child of children" [value]="child.id">{{ child.name }}</option>
          </select>
        </label>
      </div>

      <div class="stats-grid" *ngIf="currentSummary">
        <article class="stat-card">
          <span>This month</span>
          <strong>{{ currentSummary.attendancePercentage }}%</strong>
        </article>
        <article class="stat-card present">
          <span>Present</span>
          <strong>{{ currentSummary.presentDays }}</strong>
        </article>
        <article class="stat-card absent">
          <span>Absent</span>
          <strong>{{ currentSummary.absentDays }}</strong>
        </article>
        <article class="stat-card late">
          <span>Late</span>
          <strong>{{ currentSummary.lateDays }}</strong>
        </article>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Monthly summary</h2>
          <div class="picker-row">
            <input type="number" min="1" max="12" [(ngModel)]="month" (ngModelChange)="loadMonthlySummary()" />
            <input type="number" [(ngModel)]="year" (ngModelChange)="loadMonthlySummary()" />
          </div>
        </div>
        <div class="summary-grid" *ngIf="monthlySummary">
          <div><label>Present</label><strong>{{ monthlySummary.presentDays }}</strong></div>
          <div><label>Absent</label><strong>{{ monthlySummary.absentDays }}</strong></div>
          <div><label>Late</label><strong>{{ monthlySummary.lateDays }}</strong></div>
          <div><label>Leave</label><strong>{{ monthlySummary.leaveDays }}</strong></div>
          <div><label>Working days</label><strong>{{ monthlySummary.workingDays }}</strong></div>
          <div><label>Attendance %</label><strong>{{ monthlySummary.attendancePercentage }}%</strong></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Yearly summary</h2>
          <div class="picker-row">
            <input type="number" [(ngModel)]="yearlyYear" (ngModelChange)="loadYearlySummary()" />
          </div>
        </div>
        <div class="summary-grid" *ngIf="yearlySummary">
          <div><label>Present</label><strong>{{ yearlySummary.totalPresent }}</strong></div>
          <div><label>Absent</label><strong>{{ yearlySummary.totalAbsent }}</strong></div>
          <div><label>Late</label><strong>{{ yearlySummary.totalLate }}</strong></div>
          <div><label>Working days</label><strong>{{ yearlySummary.totalWorkingDays }}</strong></div>
          <div><label>Overall %</label><strong>{{ yearlySummary.overallPercentage }}%</strong></div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of history">
              <td>{{ record.attendanceDate }}</td>
              <td><span class="status-pill" [class]="record.attendanceType.toLowerCase()">{{ record.attendanceType }}</span></td>
              <td>{{ record.remarks || '-' }}</td>
            </tr>
            <tr *ngIf="!history.length">
              <td colspan="3" class="empty-cell">No attendance history found.</td>
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
      .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .child-picker { display: grid; gap: 6px; font-weight: 600; color: #334155; font-size: 0.85rem; }
      .child-picker select { border: 1px solid #dfe7f5; border-radius: 10px; padding: 8px 10px; font: inherit; }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
      .stat-card { background: white; padding: 18px; border-radius: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .stat-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,0.1); }
      .stat-card span { display: block; color: #64748b; margin-bottom: 12px; }
      .stat-card strong { font-size: 1.6rem; }
      .stat-card.present strong { color: #166534; }
      .stat-card.absent strong { color: #991b1b; }
      .stat-card.late strong { color: #92400e; }
      .card { background: white; border-radius: 20px; padding: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      .card-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
      .card-header h2 { margin: 0; font-size: 1.05rem; }
      .picker-row { display: flex; gap: 8px; }
      .picker-row input { width: 90px; border: 1px solid #dfe7f5; border-radius: 10px; padding: 8px 10px; font: inherit; }
      .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
      .summary-grid div { background: #f8fafc; border-radius: 12px; padding: 12px; transition: background 0.15s ease; }
      .summary-grid div:hover { background: #eef2ff; }
      .summary-grid label { display: block; color: #64748b; font-size: 0.8rem; }
      .summary-grid strong { font-size: 1.1rem; }
      .table-wrap { overflow: auto; background: white; border-radius: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 14px 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
      th { background: #f8fafc; }
      tbody tr { transition: background 0.15s ease; }
      tbody tr:hover { background: #f8fafc; }
      .empty-cell { text-align: center; color: #64748b; padding: 24px; }
      .status-pill { padding: 6px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: #f1f5f9; color: #334155; }
      .status-pill.present { background: #dcfce7; color: #166534; }
      .status-pill.absent { background: #fee2e2; color: #991b1b; }
      .status-pill.late { background: #fef3c7; color: #92400e; }
      .status-pill.leave, .status-pill.medical_leave { background: #e0e7ff; color: #3730a3; }
      .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; background: white; padding: 12px; border-radius: 12px; }
      .pagination button { border: none; border-radius: 10px; background: #e2e8f0; padding: 8px 12px; font-weight: 700; cursor: pointer; }
      .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    `,
  ],
})
export class ParentAttendanceComponent implements OnInit {
  children: Student[] = [];
  selectedStudentId = '';
  currentSummary: AttendanceSummary | null = null;
  monthlySummary: AttendanceSummary | null = null;
  yearlySummary: YearlySummary | null = null;
  history: AttendanceRecord[] = [];
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  yearlyYear = new Date().getFullYear();
  page = 1;
  limit = 10;
  totalPages = 1;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.studentService.getMyStudents(tenantId, 1, 20).subscribe({
      next: (response) => {
        this.children = response.data;
        this.selectedStudentId = this.children[0]?.id ?? '';
        this.loadAll();
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  onChildChange(): void {
    this.page = 1;
    this.loadAll();
  }

  changePage(nextPage: number): void {
    this.page = nextPage;
    this.loadHistory();
  }

  private loadAll(): void {
    if (!this.selectedStudentId) {
      return;
    }
    this.loadCurrentSummary();
    this.loadMonthlySummary();
    this.loadYearlySummary();
    this.loadHistory();
  }

  private loadCurrentSummary(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getChildCurrentSummary(this.selectedStudentId, tenantId).subscribe({
      next: (response) => {
        this.currentSummary = response.data;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  loadMonthlySummary(): void {
    if (!this.selectedStudentId) {
      return;
    }
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getChildMonthlySummary(this.selectedStudentId, this.month, this.year, tenantId).subscribe({
      next: (response) => {
        this.monthlySummary = response.data;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  loadYearlySummary(): void {
    if (!this.selectedStudentId) {
      return;
    }
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getChildYearlySummary(this.selectedStudentId, this.yearlyYear, tenantId).subscribe({
      next: (response) => {
        this.yearlySummary = response.data;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  private loadHistory(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getChildAttendance(this.selectedStudentId, tenantId, undefined, undefined, this.page, this.limit).subscribe({
      next: (response) => {
        this.history = response.data;
        this.totalPages = response.totalPages;
        this.cdr.detectChanges();
      },
      error: () => {
        this.history = [];
        this.cdr.detectChanges();
      },
    });
  }
}
