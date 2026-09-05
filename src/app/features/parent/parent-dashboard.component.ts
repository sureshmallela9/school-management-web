import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ParentDashboardDto, StudentWithDetailsDto } from '../../core/models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Parent dashboard</p>
          <h1>Overview</h1>
        </div>
        <a class="accent-btn" routerLink="/app/attendance">View reports</a>
      </header>

      <div class="stats-grid" *ngIf="dashboard">
        <article class="stat-card">
          <span>Children</span>
          <strong>{{ dashboard.childrenCount }}</strong>
        </article>
        <article class="stat-card">
          <span>Outstanding fees</span>
          <strong>{{ dashboard.outstandingFeeBalance | currency:'INR':'symbol':'1.0-0' }}</strong>
        </article>
        <article class="stat-card">
          <span>Unread notices</span>
          <strong>{{ dashboard.unreadNotificationCount }}</strong>
        </article>
      </div>

      <div class="student-list" *ngFor="let child of dashboard?.children ?? []">
        <article class="student-card">
          <div class="student-header">
            <div class="avatar">{{ child.name.charAt(0) }}</div>
            <div>
              <h2>{{ child.name }}</h2>
              <p>{{ child.className }} • Roll {{ child.rollNumber }}</p>
            </div>
            <span class="status-badge" [class.present]="child.todayStatus === 'Present'" [class.late]="child.todayStatus === 'Late'" [class.absent]="child.todayStatus === 'Absent'">
              {{ child.todayStatus }}
            </span>
          </div>

          <div class="summary-row">
            <div class="progress-box">
              <div class="ring" [style.--value]="child.monthlySummary?.attendancePercentage ?? 0">
                <div>{{ child.monthlySummary?.attendancePercentage ?? 0 }}%</div>
              </div>
            </div>
            <div class="summary-grid">
              <div><label>Present</label><strong>{{ child.monthlySummary?.presentDays }}</strong></div>
              <div><label>Absent</label><strong>{{ child.monthlySummary?.absentDays }}</strong></div>
              <div><label>Late</label><strong>{{ child.monthlySummary?.lateDays }}</strong></div>
              <div><label>Leave</label><strong>{{ child.monthlySummary?.leaveDays }}</strong></div>
            </div>
          </div>

          <div class="mini-section">
            <h3>Recent attendance</h3>
            <ul class="attendance-list">
              <li *ngFor="let item of child.recentAttendance?.slice(0, 3) ?? []">
                <span>{{ item.attendanceDate | date:'dd MMM' }}</span>
                <strong>{{ item.attendanceType }}</strong>
              </li>
            </ul>
          </div>

          <div class="mini-section">
            <h3>Daily diary</h3>
            <ul class="diary-list">
              <li *ngFor="let item of child.dailyDiary?.slice(0, 2) ?? []">
                <a [routerLink]="['/app/daily-diary']">{{ item.title }}</a>
                <small>{{ item.subjectName }}</small>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 20px; }
      .page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      h1 { margin: 0; font-size: clamp(2rem, 3vw, 2.5rem); }
      .accent-btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border: none; border-radius: 12px; padding: 12px 16px; font-weight: 700; text-decoration: none; }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; }
      .stat-card { background: white; padding: 18px; border-radius: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06); }
      .stat-card span { display: block; color: #64748b; margin-bottom: 12px; }
      .stat-card strong { font-size: 1.7rem; }
      .student-list { display: grid; gap: 18px; }
      .student-card { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 12px 30px rgba(15,23,42,0.06); transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .student-card:hover { transform: translateY(-2px); box-shadow: 0 18px 36px rgba(15,23,42,0.1); }
      .student-header { display: flex; align-items: center; gap: 14px; }
      .avatar { width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #dbeafe, #ddd6fe); display: grid; place-items: center; font-weight: 700; color: #1d4ed8; }
      .student-header h2 { margin: 0; font-size: 1.3rem; }
      .student-header p { margin: 4px 0 0; color: #64748b; }
      .status-badge { margin-left: auto; padding: 7px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
      .status-badge.present { background: #dcfce7; color: #166534; }
      .status-badge.late { background: #fef3c7; color: #92400e; }
      .status-badge.absent { background: #fee2e2; color: #991b1b; }
      .summary-row { display: grid; grid-template-columns: 140px 1fr; gap: 18px; margin-top: 18px; }
      .ring { --value: 0; width: 100px; height: 100px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(#4f46e5 calc(var(--value) * 1%), #e2e8f0 0); position: relative; }
      .ring::before { content: ''; position: absolute; inset: 12px; border-radius: 50%; background: white; }
      .ring div { position: relative; z-index: 1; font-weight: 800; }
      .summary-grid { display: grid; grid-template-columns: repeat(2, minmax(90px, 1fr)); gap: 12px; }
      .summary-grid div { background: #f8fafc; border-radius: 12px; padding: 12px; }
      .summary-grid label { display: block; color: #64748b; font-size: 0.8rem; }
      .summary-grid strong { font-size: 1.1rem; }
      .mini-section { margin-top: 18px; }
      .mini-section h3 { margin: 0 0 10px; }
      .attendance-list, .diary-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
      .attendance-list li, .diary-list li { display: flex; justify-content: space-between; gap: 8px; background: #f8fafc; border-radius: 10px; padding: 10px 12px; transition: background 0.15s ease; }
      .attendance-list li:hover, .diary-list li:hover { background: #eef2ff; }
      .diary-list a { text-decoration: none; color: inherit; font-weight: 600; }
      .diary-list small { color: #64748b; }
      @media (max-width: 640px) { .summary-row { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ParentDashboardComponent implements OnInit {
  dashboard: ParentDashboardDto | null = null;

  constructor(private readonly dataService: MockDataService) {}

  ngOnInit(): void {
    this.dashboard = this.dataService.getParentDashboard();
  }
}
