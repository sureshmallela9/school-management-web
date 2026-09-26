import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../attendance/attendance.service';
import { AttendanceRecord } from '../attendance/attendance.model';
import { AuthService } from '../../core/services/auth.service';
import { HomeworkService } from '../../core/services/homework.service';
import { HomeworkDto } from '../../core/models/homework.model';
import { TeacherContextService } from '../../core/services/teacher-context.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Teacher workspace</p>
          <h1>Good {{ greeting }}, {{ teacherName }}</h1>
          <p class="lede">Your classes, attendance, and homework at a glance.</p>
        </div>
        <a class="primary-btn" routerLink="/teacher/attendance/mark">Mark attendance</a>
      </header>

      <p class="error" *ngIf="attendanceError || homeworkError">{{ attendanceError || homeworkError }}</p>

      <div class="stats-grid">
        <article class="stat-card"><span>Students marked today</span><strong>{{ records.length }}</strong></article>
        <article class="stat-card present"><span>Present</span><strong>{{ countStatus('PRESENT') }}</strong></article>
        <article class="stat-card absent"><span>Absent</span><strong>{{ countStatus('ABSENT') }}</strong></article>
        <article class="stat-card late"><span>Late</span><strong>{{ countStatus('LATE') }}</strong></article>
      </div>

      <section class="panel">
        <div class="section-heading">
          <div><h2>Today's attendance</h2><p>Attendance recorded for your assigned classes.</p></div>
          <a routerLink="/teacher/attendance/today">View attendance</a>
        </div>
        <p class="loading" *ngIf="attendanceLoading">Loading today's attendance…</p>
        <div class="table-wrap" *ngIf="!attendanceLoading">
          <table>
            <thead><tr><th>Student</th><th>Class</th><th>Status</th><th>Remarks</th></tr></thead>
            <tbody>
              <tr *ngFor="let record of records | slice:0:6">
                <td>{{ record.studentName || record.studentId }}</td>
                <td>{{ record.className || record.classId }}</td>
                <td><span class="status" [class]="record.attendanceType.toLowerCase()">{{ record.attendanceType }}</span></td>
                <td>{{ record.remarks || '—' }}</td>
              </tr>
              <tr *ngIf="!records.length"><td colspan="4" class="empty">No attendance records found for today.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <div class="section-heading">
          <div><h2>Recent homework</h2><p>Assignments you have created recently.</p></div>
          <a routerLink="/teacher/homework">Manage homework</a>
        </div>
        <p class="loading" *ngIf="homeworkLoading">Loading homework…</p>
        <div class="homework-list" *ngIf="!homeworkLoading">
          <article class="homework-item" *ngFor="let item of homework | slice:0:4">
            <div><strong>{{ item.title }}</strong><p>{{ item.className || item.classId }} · {{ item.subjectName || item.subjectId }}</p></div>
            <span>Due {{ item.dueDate | date:'mediumDate' }}</span>
          </article>
          <p class="empty" *ngIf="!homework.length">No homework assigned yet.</p>
        </div>
      </section>

      <section class="panel">
        <div class="section-heading"><div><h2>Your classes</h2><p>Classes remembered from your attendance and homework activity.</p></div></div>
        <div class="class-list" *ngIf="teacherContext.classIds().length; else noClasses">
          <span class="class-chip" *ngFor="let classId of teacherContext.classIds()">{{ classId }}</span>
        </div>
        <ng-template #noClasses><p class="empty">No class IDs have been discovered yet. Visit attendance or homework to add a class ID provided by your school.</p></ng-template>
      </section>
    </section>
  `,
  styles: [`
    .page-shell { display: grid; gap: 18px; }
    .page-header, .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: .12em; font-size: .72rem; color: #4f46e5; font-weight: 700; }
    h1, h2, p { margin-top: 0; } h1 { margin-bottom: 6px; font-size: clamp(1.8rem, 3vw, 2.5rem); }
    .lede, .section-heading p { margin: 0; color: #64748b; }
    .primary-btn { text-decoration: none; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: white; border-radius: 11px; padding: 12px 16px; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 14px; }
    .stat-card, .panel { background: white; border-radius: 18px; padding: 18px; box-shadow: 0 8px 20px rgba(15,23,42,.05); }
    .stat-card span { display: block; color: #64748b; margin-bottom: 10px; } .stat-card strong { font-size: 1.7rem; }
    .present strong { color: #15803d; } .absent strong { color: #b91c1c; } .late strong { color: #b45309; }
    .section-heading h2 { margin: 0 0 5px; font-size: 1.1rem; } .section-heading a { color: #4f46e5; text-decoration: none; font-weight: 700; }
    .table-wrap { overflow-x: auto; margin-top: 16px; } table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; border-bottom: 1px solid #edf2f7; text-align: left; white-space: nowrap; } th { color: #334155; background: #f8fafc; }
    .status { display: inline-block; border-radius: 999px; padding: 5px 9px; background: #f1f5f9; font-size: .75rem; font-weight: 700; }
    .status.present { background: #dcfce7; color: #166534; } .status.absent { background: #fee2e2; color: #991b1b; } .status.late { background: #fef3c7; color: #92400e; }
    .homework-list { display: grid; } .homework-item { display: flex; justify-content: space-between; gap: 12px; padding: 13px 0; border-bottom: 1px solid #edf2f7; }
    .homework-item p { margin: 5px 0 0; color: #64748b; } .homework-item span { color: #475569; white-space: nowrap; }
    .class-list { display: flex; flex-wrap: wrap; gap: 8px; } .class-chip { border-radius: 999px; padding: 8px 12px; color: #3730a3; background: #eef2ff; font-weight: 700; }
    .empty, .loading { color: #64748b; padding: 10px 0; } .error { color: #b91c1c; font-weight: 700; }
    @media (max-width: 600px) { .homework-item { flex-direction: column; } }
  `],
})
export class TeacherDashboardComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly homeworkService = inject(HomeworkService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly teacherContext = inject(TeacherContextService);

  records: AttendanceRecord[] = [];
  homework: HomeworkDto[] = [];
  attendanceLoading = true;
  homeworkLoading = true;
  attendanceError: string | null = null;
  homeworkError: string | null = null;
  readonly teacherName = this.authService.getCurrentUser()?.name?.split(' ')[0] || 'Teacher';
  readonly greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

  ngOnInit(): void {
    this.teacherContext.refresh();
    const tenantId = this.authService.getTenantId() ?? '';
    this.attendanceService.getTodayAttendance(tenantId).subscribe({
      next: (response) => { this.records = response.data || []; this.attendanceLoading = false; this.cdr.detectChanges(); },
      error: (err) => { this.attendanceError = err?.error?.message || 'Unable to load today’s attendance.'; this.attendanceLoading = false; this.cdr.detectChanges(); },
    });
    this.homeworkService.listForTeacher(this.authService.getUserId() ?? '', 0, 20).subscribe({
      next: (response) => { this.homework = response.data || []; this.homeworkLoading = false; this.cdr.detectChanges(); },
      error: (err) => { this.homeworkError = err?.error?.message || 'Unable to load homework assignments.'; this.homeworkLoading = false; this.cdr.detectChanges(); },
    });
  }

  countStatus(status: string): number {
    return this.records.filter((record) => record.attendanceType === status).length;
  }
}