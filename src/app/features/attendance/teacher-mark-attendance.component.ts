import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { StudentService } from '../../core/services/student.service';
import { AttendanceRecord, AttendanceType, ATTENDANCE_TYPES } from '../../core/models/attendance.model';
import { Student } from '../../core/models/student.model';

interface RosterRow {
  student: Student;
  attendanceType: AttendanceType;
  remarks: string;
  existingId: string | null;
}

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
          <input type="text" [(ngModel)]="classId" placeholder="class-5" (ngModelChange)="loadRoster()" />
        </label>
        <label>
          <span>Date</span>
          <input type="date" [(ngModel)]="date" [max]="maxDate" (ngModelChange)="loadRoster()" />
        </label>
      </div>

      <p class="hint" *ngIf="!isToday">Only today's attendance can be marked or edited. This date is read-only.</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No.</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of roster">
              <td>{{ row.student.name }}</td>
              <td>{{ row.student.rollNumber }}</td>
              <td>
                <select [(ngModel)]="row.attendanceType" [disabled]="!isToday">
                  <option *ngFor="let type of attendanceTypes" [value]="type">{{ type }}</option>
                </select>
              </td>
              <td>
                <input type="text" [(ngModel)]="row.remarks" [disabled]="!isToday" placeholder="Optional remarks" />
              </td>
            </tr>
            <tr *ngIf="!roster.length">
              <td colspan="4" class="empty-cell">Enter a class ID to load its student roster.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>
      <p class="success-text" *ngIf="successMessage">{{ successMessage }}</p>

      <div class="actions" *ngIf="roster.length">
        <button type="button" class="primary-btn" [disabled]="!isToday || isSaving" (click)="saveAll()">{{ isSaving ? 'Saving...' : 'Save Attendance' }}</button>
      </div>
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
      .error-text { color: #b91c1c; font-weight: 600; margin: 0; }
      .success-text { color: #166534; font-weight: 600; margin: 0; }
      .actions { display: flex; justify-content: flex-end; }
      .primary-btn { border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    `,
  ],
})
export class TeacherMarkAttendanceComponent implements OnInit {
  classId = '';
  date = new Date().toISOString().slice(0, 10);
  maxDate = new Date().toISOString().slice(0, 10);
  roster: RosterRow[] = [];
  attendanceTypes = ATTENDANCE_TYPES;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.classId = 'class-5';
    this.loadRoster();
  }

  get isToday(): boolean {
    return this.date === this.maxDate;
  }

  loadRoster(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.refreshRoster();
  }

  private refreshRoster(): void {
    if (!this.classId) {
      this.roster = [];
      return;
    }

    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.studentService.getStudents(tenantId, 1, 100).subscribe({
      next: (studentsResponse) => {
        const classStudents = studentsResponse.data.filter((s) => s.classId === this.classId);
        this.attendanceService.getClassAttendance(this.classId, this.date, tenantId).subscribe({
          next: (attendanceResponse) => {
            const existingByStudent = new Map(attendanceResponse.data.map((record) => [record.studentId, record]));
            this.roster = classStudents.map((student) => {
              const existing = existingByStudent.get(student.id);
              return {
                student,
                attendanceType: existing?.attendanceType ?? 'PRESENT',
                remarks: existing?.remarks ?? '',
                existingId: existing?.id ?? null,
              };
            });
            this.cdr.detectChanges();
          },
          error: () => this.cdr.detectChanges(),
        });
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  saveAll(): void {
    if (!this.roster.length) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    let remaining = this.roster.length;
    let hadError = false;

    const finish = () => {
      remaining -= 1;
      if (remaining === 0) {
        this.isSaving = false;
        if (!hadError) {
          this.successMessage = 'Attendance saved successfully.';
          this.refreshRoster();
        }
        this.cdr.detectChanges();
      }
    };

    for (const row of this.roster) {
      const request = {
        studentId: row.student.id,
        classId: this.classId,
        attendanceDate: this.date,
        attendanceType: row.attendanceType,
        remarks: row.remarks || undefined,
      };

      const call = row.existingId
        ? this.attendanceService.updateTeacherAttendance(row.existingId, request, tenantId)
        : this.attendanceService.markAttendance(request, tenantId);

      call.subscribe({
        next: (response) => {
          if (!response.success) {
            hadError = true;
            this.errorMessage = response.message;
          }
          finish();
        },
        error: () => {
          hadError = true;
          this.errorMessage = 'Unable to save attendance for one or more students.';
          finish();
        },
      });
    }
  }
}
