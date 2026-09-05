import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { AttendanceRecord, AttendanceType, ATTENDANCE_TYPES } from '../../core/models/attendance.model';

@Component({
  selector: 'app-teacher-mark-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>Mark Attendance</h1>
        </div>
      </div>

      <div class="filter-row">
        <label>
          <span>Class ID</span>
          <input type="text" [(ngModel)]="classId" placeholder="class id" (ngModelChange)="loadClassAttendance()" />
        </label>
        <label>
          <span>Date</span>
          <input type="date" [(ngModel)]="date" [max]="maxDate" (ngModelChange)="loadClassAttendance()" />
        </label>
      </div>

      <p class="hint" *ngIf="!isToday">Only today's attendance can be marked or edited. This date is read-only.</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Status</th>
              <th>Remarks</th>
              <th *ngIf="isToday">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of records">
              <td>{{ record.studentId }}</td>
              <ng-container *ngIf="isToday && editingId === record.id; else readonlyRow">
                <td>
                  <select [(ngModel)]="editType">
                    <option *ngFor="let type of attendanceTypes" [value]="type">{{ type }}</option>
                  </select>
                </td>
                <td>
                  <input type="text" [(ngModel)]="editRemarks" placeholder="Optional remarks" />
                </td>
                <td>
                  <button type="button" class="text-btn" (click)="saveEdit(record)">Save</button>
                  <button type="button" class="text-btn" (click)="cancelEdit()">Cancel</button>
                </td>
              </ng-container>
              <ng-template #readonlyRow>
                <td><span class="status-pill" [class]="record.attendanceType.toLowerCase()">{{ record.attendanceType }}</span></td>
                <td>{{ record.remarks || '-' }}</td>
                <td *ngIf="isToday"><button type="button" class="text-btn" (click)="startEdit(record)">Edit</button></td>
              </ng-template>
            </tr>
            <tr *ngIf="!records.length">
              <td [attr.colspan]="isToday ? 4 : 3" class="empty-cell">No attendance marked yet for this class and date.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card" *ngIf="isToday">
        <h2>Mark a student</h2>
        <div class="add-row">
          <label>
            <span>Student ID</span>
            <input type="text" [(ngModel)]="newStudentId" placeholder="student id" />
          </label>
          <label>
            <span>Status</span>
            <select [(ngModel)]="newType">
              <option *ngFor="let type of attendanceTypes" [value]="type">{{ type }}</option>
            </select>
          </label>
          <label>
            <span>Remarks</span>
            <input type="text" [(ngModel)]="newRemarks" placeholder="Optional remarks" />
          </label>
          <button type="button" class="primary-btn" [disabled]="!newStudentId || isSaving" (click)="markNewStudent()">{{ isSaving ? 'Saving...' : 'Mark' }}</button>
        </div>
      </div>

      <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>
      <p class="success-text" *ngIf="successMessage">{{ successMessage }}</p>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .filter-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; background: white; border-radius: 16px; padding: 14px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      .filter-row label { display: grid; gap: 6px; font-weight: 600; color: #334155; font-size: 0.85rem; }
      .filter-row input { border: 1px solid #dfe7f5; border-radius: 10px; padding: 10px 12px; font: inherit; }
      .hint { margin: 0; background: #fef9c3; color: #854d0e; padding: 12px 14px; border-radius: 10px; font-weight: 600; }
      .table-wrap { overflow: auto; background: white; border-radius: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 14px 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
      th { background: #f8fafc; }
      tbody tr { transition: background 0.15s ease; }
      tbody tr:hover { background: #f8fafc; }
      select, input[type="text"] { border: 1px solid #dfe7f5; border-radius: 10px; padding: 8px 10px; font: inherit; }
      .empty-cell { text-align: center; color: #64748b; padding: 24px; }
      .status-pill { padding: 6px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: #f1f5f9; color: #334155; }
      .status-pill.present { background: #dcfce7; color: #166534; }
      .status-pill.absent { background: #fee2e2; color: #991b1b; }
      .status-pill.late { background: #fef3c7; color: #92400e; }
      .status-pill.leave, .status-pill.medical_leave { background: #e0e7ff; color: #3730a3; }
      .status-pill.half_day { background: #fef9c3; color: #854d0e; }
      .status-pill.holiday { background: #f1f5f9; color: #334155; }
      .text-btn { border: none; background: #eef2ff; color: #3730a3; padding: 6px 10px; border-radius: 8px; font-weight: 700; cursor: pointer; margin-right: 6px; }
      .card { background: white; border-radius: 20px; padding: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      .card h2 { margin: 0 0 14px; font-size: 1.05rem; }
      .add-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; align-items: end; }
      .add-row label { display: grid; gap: 6px; font-weight: 600; color: #334155; font-size: 0.85rem; }
      .primary-btn { border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .error-text { color: #b91c1c; font-weight: 600; margin: 0; }
      .success-text { color: #166534; font-weight: 600; margin: 0; }
    `,
  ],
})
export class TeacherMarkAttendanceComponent implements OnInit {
  classId = '';
  date = new Date().toISOString().slice(0, 10);
  maxDate = new Date().toISOString().slice(0, 10);
  records: AttendanceRecord[] = [];
  attendanceTypes = ATTENDANCE_TYPES;

  editingId: string | null = null;
  editType: AttendanceType = 'PRESENT';
  editRemarks = '';

  newStudentId = '';
  newType: AttendanceType = 'PRESENT';
  newRemarks = '';

  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadClassAttendance();
  }

  get isToday(): boolean {
    return this.date === this.maxDate;
  }

  loadClassAttendance(): void {
    this.errorMessage = null;
    this.successMessage = null;
    if (!this.classId) {
      this.records = [];
      return;
    }

    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getClassAttendance(this.classId, this.date, tenantId).subscribe({
      next: (response) => {
        this.records = response.data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.records = [];
        this.errorMessage = err?.error?.message || 'Unable to load class attendance';
        this.cdr.detectChanges();
      },
    });
  }

  startEdit(record: AttendanceRecord): void {
    this.editingId = record.id;
    this.editType = record.attendanceType;
    this.editRemarks = record.remarks ?? '';
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(record: AttendanceRecord): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    const request = {
      studentId: record.studentId,
      classId: this.classId,
      attendanceDate: this.date,
      attendanceType: this.editType,
      remarks: this.editRemarks || undefined,
    };

    this.attendanceService.updateTeacherAttendance(record.id, request, tenantId).subscribe({
      next: (response) => {
        if (!response.success) {
          this.errorMessage = response.message;
          this.cdr.detectChanges();
          return;
        }
        this.editingId = null;
        this.successMessage = 'Attendance updated successfully.';
        this.loadClassAttendance();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to update attendance';
        this.cdr.detectChanges();
      },
    });
  }

  markNewStudent(): void {
    if (!this.newStudentId) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    const request = {
      studentId: this.newStudentId,
      classId: this.classId,
      attendanceDate: this.date,
      attendanceType: this.newType,
      remarks: this.newRemarks || undefined,
    };

    this.attendanceService.markAttendance(request, tenantId).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (!response.success) {
          this.errorMessage = response.message;
          this.cdr.detectChanges();
          return;
        }
        this.newStudentId = '';
        this.newRemarks = '';
        this.successMessage = 'Attendance marked successfully.';
        this.loadClassAttendance();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Unable to mark attendance';
        this.cdr.detectChanges();
      },
    });
  }
}
