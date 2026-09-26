import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AttendanceRecord, AttendanceSummary } from '../attendance/attendance.model';
import { AttendanceService } from '../attendance/attendance.service';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { Student } from '../../core/models/student.model';
import { FeeService } from '../fees/fees.service';

interface ChildOverview {
  student: Student;
  summary: AttendanceSummary | null;
  recentAttendance: AttendanceRecord[];
  outstandingFees: number;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Family workspace</p>
          <h1>Welcome, {{ parentName }}</h1>
          <p class="lede">A live overview of your children’s school information.</p>
        </div>
        <a class="primary-btn" routerLink="/app/students">View children</a>
      </header>

      <p class="loading" *ngIf="loading">Loading your family overview…</p>
      <div class="error-state" *ngIf="errorMessage">
        <strong>We couldn’t load your children.</strong><p>{{ errorMessage }}</p>
        <button type="button" (click)="loadChildren()">Try again</button>
      </div>

      <ng-container *ngIf="!loading && !errorMessage">
        <div class="stats-grid">
          <article class="stat-card"><span>Children linked</span><strong>{{ children.length }}</strong></article>
          <article class="stat-card"><span>Outstanding fees</span><strong>{{ totalOutstanding | currency:'INR':'symbol':'1.0-0' }}</strong></article>
          <article class="stat-card"><span>Attendance this month</span><strong>{{ familyAttendance }}<small *ngIf="familyAttendance !== '—'">%</small></strong></article>
        </div>

        <div class="empty-state" *ngIf="!children.length">No students are linked to this parent account. Contact your school administrator.</div>

        <article class="child-card" *ngFor="let child of children">
          <header class="child-header">
            <div class="avatar">{{ child.student.name.charAt(0) }}</div>
            <div class="child-title">
              <h2>{{ child.student.name }}</h2>
              <p>{{ child.student.className || child.student.classId }}<span *ngIf="child.student.section"> · Section {{ child.student.section }}</span></p>
            </div>
            <span class="roll">Roll {{ child.student.rollNumber || '—' }}</span>
          </header>

          <div class="child-stats">
            <div class="attendance-meter"><span>Attendance this month</span><strong>{{ child.summary?.attendancePercentage ?? '—' }}<small *ngIf="child.summary">%</small></strong></div>
            <div class="metric"><span>Present</span><strong>{{ child.summary?.presentDays ?? '—' }}</strong></div>
            <div class="metric"><span>Absent</span><strong>{{ child.summary?.absentDays ?? '—' }}</strong></div>
            <div class="metric"><span>Late</span><strong>{{ child.summary?.lateDays ?? '—' }}</strong></div>
            <div class="metric fees"><span>Outstanding fees</span><strong>{{ child.outstandingFees | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          </div>

          <section class="recent-section">
            <div class="section-heading"><h3>Recent attendance</h3><a routerLink="/app/attendance">Full history</a></div>
            <ul class="attendance-list" *ngIf="child.recentAttendance.length; else noAttendance">
              <li *ngFor="let record of child.recentAttendance">
                <span>{{ record.attendanceDate | date:'mediumDate' }}</span>
                <strong class="status" [class]="record.attendanceType.toLowerCase()">{{ record.attendanceType }}</strong>
                <small>{{ record.remarks || '' }}</small>
              </li>
            </ul>
            <ng-template #noAttendance><p class="empty-inline">No recent attendance records.</p></ng-template>
          </section>

          <nav class="child-actions" aria-label="Child information">
            <a [routerLink]="['/app/students', child.student.id]">Student profile</a>
            <a routerLink="/app/attendance">Attendance</a>
            <a routerLink="/app/fees">Fee details</a>
            <a routerLink="/app/daily-diary">Homework diary</a>
          </nav>
        </article>
      </ng-container>
    </section>
  `,
  styles: [`
    .page-shell { display: grid; gap: 18px; }
    .page-header, .child-header, .section-heading { display: flex; align-items: center; gap: 14px; }
    .page-header, .section-heading { justify-content: space-between; flex-wrap: wrap; }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: .12em; color: #4f46e5; font-size: .72rem; font-weight: 700; }
    h1, h2, h3, p { margin-top: 0; } h1 { margin-bottom: 6px; font-size: clamp(1.8rem,3vw,2.5rem); }
    .lede, .child-title p { margin: 0; color: #64748b; }
    .primary-btn { color: white; text-decoration: none; background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 11px; padding: 12px 16px; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(170px,1fr)); gap: 14px; }
    .stat-card, .child-card, .empty-state, .error-state { background: white; border-radius: 18px; padding: 18px; box-shadow: 0 8px 20px rgba(15,23,42,.05); }
    .stat-card span, .attendance-meter span, .metric span { display: block; color: #64748b; margin-bottom: 8px; }
    .stat-card strong { font-size: 1.6rem; } .stat-card small, .attendance-meter small { font-size: .9rem; }
    .child-card { display: grid; gap: 18px; } .child-title { flex: 1; } .child-title h2 { margin: 0 0 5px; }
    .avatar { width: 48px; height: 48px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 15px; background: linear-gradient(135deg,#dbeafe,#ddd6fe); color: #3730a3; font-weight: 800; font-size: 1.2rem; }
    .roll { color: #475569; font-weight: 700; white-space: nowrap; }
    .child-stats { display: grid; grid-template-columns: repeat(auto-fit,minmax(120px,1fr)); gap: 10px; }
    .attendance-meter, .metric { background: #f8fafc; border-radius: 13px; padding: 13px; }
    .attendance-meter strong { font-size: 1.5rem; color: #4338ca; } .metric strong { font-size: 1.15rem; } .metric.fees { grid-column: span 2; }
    .section-heading { margin-bottom: 10px; } .section-heading h3 { margin: 0; font-size: 1rem; } .section-heading a, .child-actions a { color: #4f46e5; text-decoration: none; font-weight: 700; }
    .attendance-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
    .attendance-list li { display: grid; grid-template-columns: minmax(100px,.7fr) auto 1.5fr; align-items: center; gap: 10px; background: #f8fafc; padding: 10px 12px; border-radius: 10px; }
    .attendance-list small { color: #64748b; } .status { justify-self: start; border-radius: 999px; padding: 5px 9px; background: #f1f5f9; font-size: .72rem; }
    .status.present { background: #dcfce7; color: #166534; } .status.absent { background: #fee2e2; color: #991b1b; } .status.late { background: #fef3c7; color: #92400e; }
    .child-actions { display: flex; flex-wrap: wrap; gap: 10px 20px; border-top: 1px solid #edf2f7; padding-top: 14px; }
    .loading, .empty-inline { color: #64748b; } .error-state { color: #b91c1c; } .error-state p { margin: 6px 0 12px; }
    .error-state button { border: 0; border-radius: 9px; padding: 9px 13px; background: #eef2ff; color: #3730a3; font-weight: 700; cursor: pointer; }
    @media (max-width: 600px) { .attendance-list li { grid-template-columns: 1fr auto; } .attendance-list small { grid-column: 1 / -1; } .metric.fees { grid-column: auto; } }
  `],
})
export class ParentDashboardComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly feeService = inject(FeeService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  children: ChildOverview[] = [];
  loading = true;
  detailRequestsPending = 0;
  errorMessage: string | null = null;
  readonly parentName = this.authService.getCurrentUser()?.name?.split(' ')[0] || 'there';

  get totalOutstanding(): number {
    return this.children.reduce((total, child) => total + child.outstandingFees, 0);
  }

  get familyAttendance(): number | string {
    const summaries = this.children.map((child) => child.summary).filter((summary): summary is AttendanceSummary => summary !== null);
    if (!summaries.length) return '—';
    const workingDays = summaries.reduce((total, summary) => total + (summary.workingDays || 0), 0);
    const presentDays = summaries.reduce((total, summary) => total + (summary.presentDays || 0), 0);
    return workingDays ? Math.round((presentDays / workingDays) * 100) : 0;
  }

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.loading = true;
    this.errorMessage = null;
    const tenantId = this.authService.getTenantId() ?? '';
    this.studentService.getMyStudents(tenantId, 1, 50).subscribe({
      next: (response) => {
        this.children = (response.data || []).map((student) => ({ student, summary: null, recentAttendance: [], outstandingFees: 0 }));
        this.detailRequestsPending = this.children.length;
        if (!this.children.length) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        this.children.forEach((child) => this.loadChildDetails(child, tenantId));
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Unable to load linked students.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadChildDetails(child: ChildOverview, tenantId: string): void {
    forkJoin({
      summary: this.attendanceService.getChildCurrentSummary(child.student.id, tenantId).pipe(catchError(() => of(null))),
      attendance: this.attendanceService.getChildAttendance(child.student.id, tenantId, undefined, undefined, 1, 3).pipe(catchError(() => of(null))),
      fees: this.feeService.getParentSummary(child.student.id, undefined, 1, 100, tenantId).pipe(catchError(() => of(null))),
    }).subscribe(({ summary, attendance, fees }) => {
      child.summary = summary?.data ?? null;
      child.recentAttendance = attendance?.data ?? [];
      child.outstandingFees = (fees?.data ?? []).reduce((total, entry) => total + (entry.outstandingAmount || 0), 0);
      this.detailRequestsPending -= 1;
      if (this.detailRequestsPending === 0) this.loading = false;
      this.cdr.detectChanges();
    });
  }
}