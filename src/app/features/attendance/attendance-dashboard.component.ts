import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { AttendanceDashboard } from '../../core/models/attendance.model';

@Component({
  selector: 'app-attendance-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>Dashboard</h1>
        </div>
        <button type="button" class="ghost-btn" (click)="goTo('/admin/attendance')">Back to list</button>
      </div>

      <div class="stats-grid" *ngIf="dashboard">
        <article class="stat-card present">
          <span>Present today</span>
          <strong>{{ dashboard.presentCount }}</strong>
        </article>
        <article class="stat-card absent">
          <span>Absent today</span>
          <strong>{{ dashboard.absentCount }}</strong>
        </article>
        <article class="stat-card late">
          <span>Late today</span>
          <strong>{{ dashboard.lateCount }}</strong>
        </article>
        <article class="stat-card leave">
          <span>Leave today</span>
          <strong>{{ dashboard.leaveCount }}</strong>
        </article>
        <article class="stat-card holiday">
          <span>Holiday</span>
          <strong>{{ dashboard.holidayCount }}</strong>
        </article>
        <article class="stat-card">
          <span>Total students</span>
          <strong>{{ dashboard.totalStudents }}</strong>
        </article>
        <article class="stat-card highlight">
          <span>Attendance % today</span>
          <strong>{{ dashboard.attendancePercentageToday }}%</strong>
        </article>
      </div>

      <div class="card" *ngIf="dashboard">
        <h2>Students below 75% attendance</h2>
        <ul class="alert-list" *ngIf="dashboard.studentsBelow75Percent.length; else noAlerts">
          <li *ngFor="let item of dashboard.studentsBelow75Percent">
            <span>{{ item.studentId }}</span>
            <strong>{{ item.attendancePercentage }}%</strong>
          </li>
        </ul>
        <ng-template #noAlerts>
          <p class="empty-text">No students are currently below the 75% attendance threshold.</p>
        </ng-template>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .ghost-btn { border: none; background: #eef2ff; color: #3730a3; padding: 12px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
      .stat-card { background: white; padding: 18px; border-radius: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .stat-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,0.1); }
      .stat-card span { display: block; color: #64748b; margin-bottom: 12px; }
      .stat-card strong { font-size: 1.8rem; }
      .stat-card.present strong { color: #166534; }
      .stat-card.absent strong { color: #991b1b; }
      .stat-card.late strong { color: #92400e; }
      .stat-card.leave strong { color: #3730a3; }
      .stat-card.highlight { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
      .stat-card.highlight span, .stat-card.highlight strong { color: white; }
      .card { background: white; border-radius: 20px; padding: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      .card h2 { margin: 0 0 14px; font-size: 1.1rem; }
      .alert-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
      .alert-list li { display: flex; justify-content: space-between; background: #fef2f2; border-radius: 10px; padding: 12px 14px; transition: background 0.15s ease; }
      .alert-list li:hover { background: #fee2e2; }
      .alert-list strong { color: #991b1b; }
      .empty-text { color: #64748b; margin: 0; }
    `,
  ],
})
export class AttendanceDashboardComponent implements OnInit {
  dashboard: AttendanceDashboard | null = null;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getDashboard(tenantId).subscribe({
      next: (response) => {
        this.dashboard = response.data;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}
