import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { StudentService } from '../../core/services/student.service';
import { ATTENDANCE_TYPES, AttendanceRecord, AttendanceType } from '../../core/models/attendance.model';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>Attendance Records</h1>
        </div>
        <div class="header-actions">
          <button type="button" class="ghost-btn" (click)="goTo('/admin/attendance/dashboard')">Dashboard</button>
          <button type="button" class="ghost-btn" (click)="goTo('/admin/attendance/audit')">Audit Trail</button>
          <button type="button" class="ghost-btn" (click)="goTo('/admin/attendance/reports')">Reports</button>
          <button type="button" class="primary-btn" (click)="goTo('/admin/attendance/create')">Create New Attendance</button>
        </div>
      </div>

      <div class="filter-row">
        <label>
          <span>Class</span>
          <select [(ngModel)]="filters.classId" (ngModelChange)="onFilterChange()">
            <option [ngValue]="undefined">All classes</option>
            <option *ngFor="let cls of classOptions" [ngValue]="cls.id">{{ cls.name }}</option>
          </select>
        </label>
        <label>
          <span>Student</span>
          <select [(ngModel)]="filters.studentId" (ngModelChange)="onFilterChange()">
            <option [ngValue]="undefined">All students</option>
            <option *ngFor="let student of students" [ngValue]="student.id">{{ student.name }} ({{ student.rollNumber }})</option>
          </select>
        </label>
        <label>
          <span>Date</span>
          <input type="date" [(ngModel)]="filters.attendanceDate" (ngModelChange)="onFilterChange()" />
        </label>
        <label>
          <span>Type</span>
          <select [(ngModel)]="filters.attendanceType" (ngModelChange)="onFilterChange()">
            <option [ngValue]="undefined">All</option>
            <option *ngFor="let type of attendanceTypes" [ngValue]="type">{{ type }}</option>
          </select>
        </label>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Date</th>
              <th>Type</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of records">
              <td>{{ studentLabel(record) }}</td>
              <td>{{ classLabel(record) }}</td>
              <td>{{ record.attendanceDate }}</td>
              <td><span class="status-pill" [class]="record.attendanceType.toLowerCase()">{{ record.attendanceType }}</span></td>
              <td>{{ record.remarks || '-' }}</td>
              <td class="action-cell">
                <button type="button" class="text-btn" (click)="editRecord(record)">Edit</button>
                <button type="button" class="danger-btn" (click)="deleteRecord(record)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="!records.length">
              <td colspan="6" class="empty-cell">No attendance records found for these filters.</td>
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
      .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
      .primary-btn, .ghost-btn, .text-btn, .danger-btn, .pagination button { border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .primary-btn { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 12px 16px; }
      .ghost-btn { background: #eef2ff; color: #3730a3; padding: 12px 14px; }
      .text-btn { background: #eef2ff; color: #3730a3; padding: 8px 10px; }
      .danger-btn { background: #fee2e2; color: #991b1b; padding: 8px 10px; }
      .filter-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; background: white; border-radius: 16px; padding: 14px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      .filter-row label { display: grid; gap: 6px; font-weight: 600; color: #334155; font-size: 0.85rem; }
      .filter-row input, .filter-row select { border: 1px solid #dfe7f5; border-radius: 10px; padding: 10px 12px; font: inherit; }
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
      .status-pill.half_day { background: #fef9c3; color: #854d0e; }
      .status-pill.holiday { background: #f1f5f9; color: #334155; }
      .action-cell { display: flex; gap: 8px; flex-wrap: wrap; }
      .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; background: white; padding: 12px; border-radius: 12px; }
      .pagination button { background: #e2e8f0; padding: 8px 12px; }
      .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    `,
  ],
})
export class AttendanceListComponent implements OnInit {
  records: AttendanceRecord[] = [];
  students: Student[] = [];
  classOptions: { id: string; name: string }[] = [];
  private studentMap = new Map<string, Student>();
  attendanceTypes = ATTENDANCE_TYPES;
  filters: { classId?: string; studentId?: string; attendanceDate?: string; attendanceType?: AttendanceType } = {};
  page = 1;
  limit = 20;
  totalPages = 1;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadRecords();
  }

  studentLabel(record: AttendanceRecord): string {
    return record.studentName || this.studentMap.get(record.studentId)?.name || record.studentId;
  }

  classLabel(record: AttendanceRecord): string {
    return record.className || this.studentMap.get(record.studentId)?.className || record.classId;
  }

  private loadStudents(): void {
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
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadRecords();
  }

  changePage(nextPage: number): void {
    this.page = nextPage;
    this.loadRecords();
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  editRecord(record: AttendanceRecord): void {
    this.router.navigateByUrl(`/admin/attendance/${record.id}/edit`);
  }

  deleteRecord(record: AttendanceRecord): void {
    const confirmed = window.confirm(`Delete attendance for ${record.studentName || record.studentId} on ${record.attendanceDate}? This action is permanent.`);
    if (!confirmed) {
      return;
    }

    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.deleteAttendance(record.id, tenantId).subscribe({
      next: () => this.loadRecords(),
      error: (err) => {
        window.alert(err?.error?.message || err?.message || 'Unable to delete attendance record');
        this.cdr.detectChanges();
      },
    });
  }

  private loadRecords(): void {
    this.attendanceService.getAttendanceList(this.filters, this.page, this.limit).subscribe({
      next: (response) => {
        this.records = response.data;
        this.totalPages = response.totalPages;
        this.cdr.detectChanges();
      },
      error: () => {
        this.records = [];
        this.cdr.detectChanges();
      },
    });
  }
}
