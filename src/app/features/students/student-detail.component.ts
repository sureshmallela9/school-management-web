import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttendanceRecord, AttendanceSummary } from '../attendance/attendance.model';
import { AttendanceService } from '../attendance/attendance.service';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div><p class="eyebrow">Child profile</p><h1>{{ student?.name || 'Student profile' }}</h1></div>
        <a routerLink="/app/students" class="ghost-link">Back to children</a>
      </header>
      <p class="loading" *ngIf="loading">Loading student profile…</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <ng-container *ngIf="student as child">
        <div class="profile-grid">
          <article class="card detail-card">
            <div class="profile-heading"><div class="avatar">{{ child.name.charAt(0) }}</div><div><h2>{{ child.name }}</h2><p>{{ child.className || child.classId }}<span *ngIf="child.section"> · Section {{ child.section }}</span></p></div></div>
            <dl>
              <div><dt>Roll number</dt><dd>{{ child.rollNumber || '—' }}</dd></div>
              <div><dt>Admission number</dt><dd>{{ child.admissionNumber || '—' }}</dd></div>
              <div><dt>Date of birth</dt><dd>{{ child.dateOfBirth ? (child.dateOfBirth | date:'mediumDate') : '—' }}</dd></div>
              <div><dt>Gender</dt><dd>{{ child.gender || '—' }}</dd></div>
              <div><dt>Blood group</dt><dd>{{ child.bloodGroup || '—' }}</dd></div>
              <div><dt>Address</dt><dd>{{ child.address || '—' }}</dd></div>
            </dl>
          </article>
          <article class="card attendance-card">
            <h3>This month's attendance</h3>
            <div class="ring" [style.--value]="summary?.attendancePercentage ?? 0"><div>{{ summary?.attendancePercentage ?? '—' }}<small *ngIf="summary">%</small></div></div>
            <p>Present <strong>{{ summary?.presentDays ?? '—' }}</strong></p>
            <p>Absent <strong>{{ summary?.absentDays ?? '—' }}</strong></p>
            <p>Late <strong>{{ summary?.lateDays ?? '—' }}</strong></p>
            <p>Leave <strong>{{ summary?.leaveDays ?? '—' }}</strong></p>
          </article>
        </div>
        <article class="card">
          <div class="section-heading"><h3>Recent attendance</h3><a routerLink="/app/attendance">View full attendance</a></div>
          <ul class="list" *ngIf="recentAttendance.length; else noRecords">
            <li *ngFor="let record of recentAttendance"><span>{{ record.attendanceDate | date:'mediumDate' }}</span><strong class="status" [class]="record.attendanceType.toLowerCase()">{{ record.attendanceType }}</strong><small>{{ record.remarks || '—' }}</small></li>
          </ul>
          <ng-template #noRecords><p class="empty">No attendance records found.</p></ng-template>
        </article>
      </ng-container>
    </section>
  `,
  styles: [`
    .page-shell { display: grid; gap: 18px; } .page-header, .section-heading, .profile-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: .1em; font-size: .72rem; color: #4f46e5; font-weight: 700; } h1,h2,h3,p { margin-top: 0; } h1 { margin-bottom: 0; }
    .ghost-link, .section-heading a { color: #4f46e5; font-weight: 700; text-decoration: none; } .profile-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 18px; }
    .card { background: white; border-radius: 18px; padding: 18px; box-shadow: 0 8px 20px rgba(15,23,42,.05); } .profile-heading { justify-content: flex-start; }
    .avatar { width: 58px; height: 58px; border-radius: 17px; background: linear-gradient(135deg,#dbeafe,#ddd6fe); display: grid; place-items: center; font-weight: 800; color: #3730a3; font-size: 1.3rem; }
    .profile-heading h2 { margin: 0 0 5px; } .profile-heading p { margin: 0; color: #64748b; }
    dl { margin: 20px 0 0; display: grid; gap: 12px; } dl div { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid #edf2f7; padding-bottom: 8px; } dt { color: #64748b; } dd { margin: 0; text-align: right; }
    .attendance-card h3 { margin-bottom: 14px; } .ring { --value: 0; width: 120px; height: 120px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(#4f46e5 calc(var(--value) * 1%),#e2e8f0 0); position: relative; margin: 0 auto 18px; }
    .ring::before { content: ''; position: absolute; inset: 14px; border-radius: 50%; background: white; } .ring div { position: relative; z-index: 1; font-weight: 800; font-size: 1.2rem; }
    .ring small { font-size: .8rem; } .attendance-card p { display: flex; justify-content: space-between; margin-bottom: 9px; color: #64748b; } .attendance-card p strong { color: #1e293b; }
    .section-heading { margin-bottom: 12px; } .section-heading h3 { margin: 0; } .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 9px; }
    .list li { display: grid; grid-template-columns: 1fr auto 1.4fr; align-items: center; gap: 12px; background: #f8fafc; padding: 11px 12px; border-radius: 10px; }
    .list small { color: #64748b; } .status { border-radius: 999px; padding: 5px 9px; background: #f1f5f9; font-size: .72rem; }
    .status.present { background: #dcfce7; color: #166534; } .status.absent { background: #fee2e2; color: #991b1b; } .status.late { background: #fef3c7; color: #92400e; }
    .loading,.empty { color: #64748b; } .error { color: #b91c1c; font-weight: 700; }
    @media (max-width: 640px) { .profile-grid { grid-template-columns: 1fr; } .list li { grid-template-columns: 1fr auto; } .list small { grid-column: 1 / -1; } }
  `],
})
export class StudentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly studentService = inject(StudentService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  student: Student | null = null;
  summary: AttendanceSummary | null = null;
  recentAttendance: AttendanceRecord[] = [];
  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (!studentId) {
      this.errorMessage = 'Student was not found.';
      this.loading = false;
      return;
    }
    const tenantId = this.authService.getTenantId() ?? '';
    this.studentService.getMyStudents(tenantId, 1, 100).subscribe({
      next: (response) => {
        this.student = (response.data || []).find((item) => item.id === studentId) ?? null;
        if (!this.student) {
          this.errorMessage = 'This student is not linked to your account.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        this.loadAttendance(this.student.id, tenantId);
      },
      error: (err) => { this.errorMessage = err?.error?.message || err?.message || 'Unable to load student profile.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  private loadAttendance(studentId: string, tenantId: string): void {
    this.attendanceService.getChildCurrentSummary(studentId, tenantId).subscribe({
      next: (response) => { this.summary = response.data; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges(),
    });
    this.attendanceService.getChildAttendance(studentId, tenantId, undefined, undefined, 1, 10).subscribe({
      next: (response) => { this.recentAttendance = response.data || []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }
}