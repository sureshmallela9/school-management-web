import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-attendance-reports-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>Reports</h1>
        </div>
        <a routerLink="/admin/attendance" class="ghost-link">Back to list</a>
      </div>

      <div class="report-grid">
        <a *ngFor="let report of reports" class="report-card" [routerLink]="['/admin/attendance/reports', report.type]">
          <h2>{{ report.label }}</h2>
          <p>{{ report.description }}</p>
        </a>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .ghost-link { color: #4f46e5; font-weight: 700; text-decoration: none; }
      .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
      .report-card { background: white; border-radius: 18px; padding: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); text-decoration: none; color: inherit; transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .report-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,0.1); }
      .report-card h2 { margin: 0 0 8px; font-size: 1.05rem; color: #1e293b; }
      .report-card p { margin: 0; color: #64748b; font-size: 0.9rem; }
    `,
  ],
})
export class AttendanceReportsHubComponent {
  reports = [
    { type: 'daily', label: 'Daily Report', description: 'Attendance records for a specific date.' },
    { type: 'monthly', label: 'Monthly Summary Report', description: 'Per-student summary for a month.' },
    { type: 'yearly', label: 'Yearly Summary Report', description: 'Per-student summary for a year.' },
    { type: 'class', label: 'Class Report', description: 'Attendance records for a class within a date range.' },
    { type: 'student', label: 'Student Report', description: 'Attendance records for a student within a date range.' },
    { type: 'low-attendance', label: 'Low Attendance Report', description: 'Students below an attendance percentage threshold.' },
    { type: 'percentage', label: 'Percentage Report', description: 'All students sorted by attendance percentage.' },
  ];
}
