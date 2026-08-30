import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { AttendanceRecord } from '../../core/models/attendance.model';

@Component({
  selector: 'app-teacher-today-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>Today's Attendance</h1>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of records">
              <td>{{ record.studentName || record.studentId }}</td>
              <td>{{ record.className || record.classId }}</td>
              <td><span class="status-pill" [class]="record.attendanceType.toLowerCase()">{{ record.attendanceType }}</span></td>
              <td>{{ record.remarks || '-' }}</td>
            </tr>
            <tr *ngIf="!records.length">
              <td colspan="4" class="empty-cell">No attendance has been marked yet today.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
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
    `,
  ],
})
export class TeacherTodayAttendanceComponent implements OnInit {
  records: AttendanceRecord[] = [];

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getTodayAttendance(tenantId).subscribe({
      next: (response) => {
        this.records = response.data;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }
}
