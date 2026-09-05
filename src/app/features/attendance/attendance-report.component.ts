import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { StudentService } from '../../core/services/student.service';
import { AttendanceRecord, AttendanceSummary } from '../../core/models/attendance.model';
import { Student } from '../../core/models/student.model';

type ReportType = 'daily' | 'monthly' | 'yearly' | 'class' | 'student' | 'low-attendance' | 'percentage';

const REPORT_LABELS: Record<ReportType, string> = {
  daily: 'Daily Report',
  monthly: 'Monthly Summary Report',
  yearly: 'Yearly Summary Report',
  class: 'Class Report',
  student: 'Student Report',
  'low-attendance': 'Low Attendance Report',
  percentage: 'Percentage Report',
};

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance report</p>
          <h1>{{ label }}</h1>
        </div>
        <button type="button" class="ghost-btn" (click)="goTo('/admin/attendance/reports')">Back to reports</button>
      </div>

      <div class="filter-row">
        <label *ngIf="showClassId">
          <span>Class</span>
          <select [(ngModel)]="filters.classId">
            <option [ngValue]="undefined">All classes</option>
            <option *ngFor="let cls of classOptions" [ngValue]="cls.id">{{ cls.name }}</option>
          </select>
        </label>
        <label *ngIf="showStudentId">
          <span>Student</span>
          <select [(ngModel)]="filters.studentId">
            <option value="">Select a student</option>
            <option *ngFor="let student of students" [ngValue]="student.id">{{ student.name }} ({{ student.rollNumber }})</option>
          </select>
        </label>
        <label *ngIf="showDate">
          <span>Date</span>
          <input type="date" [(ngModel)]="filters.date" />
        </label>
        <label *ngIf="showDateRange">
          <span>From date</span>
          <input type="date" [(ngModel)]="filters.fromDate" />
        </label>
        <label *ngIf="showDateRange">
          <span>To date</span>
          <input type="date" [(ngModel)]="filters.toDate" />
        </label>
        <label *ngIf="showMonthYear">
          <span>Month</span>
          <input type="number" min="1" max="12" [(ngModel)]="filters.month" />
        </label>
        <label *ngIf="showMonthYear">
          <span>Year</span>
          <input type="number" [(ngModel)]="filters.year" />
        </label>
        <label *ngIf="showThreshold">
          <span>Threshold %</span>
          <input type="number" [(ngModel)]="filters.threshold" />
        </label>
        <button type="button" class="primary-btn" (click)="runReport()">Run report</button>
      </div>

      <div class="table-wrap" *ngIf="isRecordReport; else summaryTable">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Date</th>
              <th>Type</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of recordResults">
              <td>{{ studentLabel(record.studentId, record.studentName) }}</td>
              <td>{{ classLabel(record.studentId, record.className, record.classId) }}</td>
              <td>{{ record.attendanceDate }}</td>
              <td>{{ record.attendanceType }}</td>
              <td>{{ record.remarks || '-' }}</td>
            </tr>
            <tr *ngIf="!recordResults.length">
              <td colspan="5" class="empty-cell">No records found. Adjust filters and run the report.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #summaryTable>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Working Days</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Leave</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let summary of summaryResults">
                <td>{{ studentLabel(summary.studentId, summary.studentName) }}</td>
                <td>{{ summary.workingDays }}</td>
                <td>{{ summary.presentDays }}</td>
                <td>{{ summary.absentDays }}</td>
                <td>{{ summary.lateDays }}</td>
                <td>{{ summary.leaveDays }}</td>
                <td [class.low]="summary.attendancePercentage < 75">{{ summary.attendancePercentage }}%</td>
              </tr>
              <tr *ngIf="!summaryResults.length">
                <td colspan="7" class="empty-cell">No summary data found. Adjust filters and run the report.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-template>

      <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .ghost-btn { border: none; background: #eef2ff; color: #3730a3; padding: 12px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .primary-btn { border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; align-self: end; }
      .filter-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; align-items: end; background: white; border-radius: 16px; padding: 14px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      .filter-row label { display: grid; gap: 6px; font-weight: 600; color: #334155; font-size: 0.85rem; }
      .filter-row input { border: 1px solid #dfe7f5; border-radius: 10px; padding: 10px 12px; font: inherit; }
      .table-wrap { overflow: auto; background: white; border-radius: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 14px 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
      th { background: #f8fafc; }
      tbody tr { transition: background 0.15s ease; }
      tbody tr:hover { background: #f8fafc; }
      td.low { color: #991b1b; font-weight: 700; }
      .empty-cell { text-align: center; color: #64748b; padding: 24px; }
      .error-text { color: #b91c1c; font-weight: 600; margin: 0; }
    `,
  ],
})
export class AttendanceReportComponent implements OnInit {
  reportType: ReportType = 'daily';
  label = '';
  recordResults: AttendanceRecord[] = [];
  summaryResults: AttendanceSummary[] = [];
  isRecordReport = true;
  errorMessage: string | null = null;
  students: Student[] = [];
  classOptions: { id: string; name: string }[] = [];
  private studentMap = new Map<string, Student>();

  filters: { classId?: string; studentId?: string; date?: string; fromDate?: string; toDate?: string; month?: number; year?: number; threshold?: number } = {
    date: new Date().toISOString().slice(0, 10),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    threshold: 75,
  };

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.reportType = (this.route.snapshot.paramMap.get('type') as ReportType) ?? 'daily';
    this.label = REPORT_LABELS[this.reportType] ?? 'Report';
    this.isRecordReport = this.reportType === 'daily' || this.reportType === 'class' || this.reportType === 'student';

    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.studentService.getStudents(tenantId, 1, 200).subscribe({
      next: (response) => {
        this.students = response.data;
        this.studentMap = new Map(this.students.map((student) => [student.id, student]));
        const uniqueClasses = new Map(this.students.map((student) => [student.classId, student.className || student.classId]));
        this.classOptions = Array.from(uniqueClasses, ([id, name]) => ({ id, name }));
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });

    this.runReport();
  }

  studentLabel(studentId: string, studentName?: string): string {
    return studentName || this.studentMap.get(studentId)?.name || studentId;
  }

  classLabel(studentId: string, className?: string, classId?: string): string {
    return className || this.studentMap.get(studentId)?.className || classId || '-';
  }

  get showClassId(): boolean {
    return this.reportType === 'daily' || this.reportType === 'monthly' || this.reportType === 'yearly' || this.reportType === 'class' || this.reportType === 'low-attendance' || this.reportType === 'percentage';
  }

  get showStudentId(): boolean {
    return this.reportType === 'student';
  }

  get showDate(): boolean {
    return this.reportType === 'daily';
  }

  get showDateRange(): boolean {
    return this.reportType === 'class' || this.reportType === 'student';
  }

  get showMonthYear(): boolean {
    return this.reportType === 'monthly' || this.reportType === 'yearly' || this.reportType === 'low-attendance' || this.reportType === 'percentage';
  }

  get showThreshold(): boolean {
    return this.reportType === 'low-attendance';
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  runReport(): void {
    this.errorMessage = null;
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    const { classId, studentId, date, fromDate, toDate, month, year, threshold } = this.filters;

    switch (this.reportType) {
      case 'daily':
        this.attendanceService.getDailyReport(tenantId, date ?? new Date().toISOString().slice(0, 10), classId).subscribe(this.recordHandler());
        break;
      case 'class':
        if (!classId) {
          this.errorMessage = 'Select a class before running the class report.';
          return;
        }
        this.attendanceService.getClassReport(classId ?? '', tenantId, fromDate, toDate).subscribe(this.recordHandler());
        break;
      case 'student':
        if (!studentId) {
          this.errorMessage = 'Select a student before running the student report.';
          return;
        }
        this.attendanceService.getStudentReport(studentId ?? '', tenantId, fromDate, toDate).subscribe(this.recordHandler());
        break;
      case 'monthly':
        this.attendanceService.getMonthlyReport(tenantId, month ?? 1, year ?? 2026, classId).subscribe(this.summaryHandler());
        break;
      case 'yearly':
        this.attendanceService.getYearlyReport(tenantId, year ?? 2026, classId).subscribe(this.summaryHandler());
        break;
      case 'low-attendance':
        this.attendanceService.getLowAttendanceReport(tenantId, month ?? 1, year ?? 2026, threshold ?? 75, classId).subscribe(this.summaryHandler());
        break;
      case 'percentage':
        this.attendanceService.getPercentageReport(tenantId, month ?? 1, year ?? 2026, classId).subscribe(this.summaryHandler());
        break;
    }
  }

  private recordHandler() {
    return {
      next: (response: { data: AttendanceRecord[] }) => {
        this.recordResults = response.data;
        this.cdr.detectChanges();
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        this.recordResults = [];
        this.errorMessage = err?.error?.message || err?.message || 'Unable to load report';
        this.cdr.detectChanges();
      },
    };
  }

  private summaryHandler() {
    return {
      next: (response: { data: AttendanceSummary[] }) => {
        this.summaryResults = response.data;
        this.cdr.detectChanges();
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        this.summaryResults = [];
        this.errorMessage = err?.error?.message || err?.message || 'Unable to load report';
        this.cdr.detectChanges();
      },
    };
  }
}
