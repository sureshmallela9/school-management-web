import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>History</h1>
        </div>
      </header>

      <div class="list-card">
        <div class="filter-row">
          <span>Student</span>
          <select>
            <option>Aisha Sharma</option>
            <option>Rohan Sharma</option>
          </select>
          <span>Last 30 days</span>
        </div>

        <div class="attendance-item" *ngFor="let item of attendanceData">
          <div>
            <strong>{{ item.date }}</strong>
            <small>{{ item.student }}</small>
          </div>
          <span class="status" [class.present]="item.status === 'Present'" [class.late]="item.status === 'Late'" [class.absent]="item.status === 'Absent'">{{ item.status }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .list-card { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 10px 24px rgba(15,23,42,0.06); }
      .filter-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; background: #f8fafc; border-radius: 12px; padding: 12px; margin-bottom: 14px; }
      select { padding: 10px 12px; border: 1px solid #dfe7f5; border-radius: 10px; }
      .attendance-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #edf2f7; }
      .attendance-item:last-child { border-bottom: none; }
      .attendance-item small { display: block; color: #64748b; margin-top: 4px; }
      .status { padding: 6px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
      .status.present { background: #dcfce7; color: #166534; }
      .status.late { background: #fef3c7; color: #92400e; }
      .status.absent { background: #fee2e2; color: #991b1b; }
    `,
  ],
})
export class AttendanceListComponent {
  attendanceData = [
    { date: '27 Aug 2026', student: 'Aisha Sharma', status: 'Present' },
    { date: '26 Aug 2026', student: 'Aisha Sharma', status: 'Late' },
    { date: '25 Aug 2026', student: 'Rohan Sharma', status: 'Absent' },
    { date: '24 Aug 2026', student: 'Rohan Sharma', status: 'Present' },
  ];

  constructor(private readonly dataService: MockDataService) {}
}
