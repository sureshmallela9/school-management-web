import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentWithDetailsDto } from '../../core/models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  template: `
    <section class="page-shell" *ngIf="student as currentStudent">
      <header class="page-header">
        <div>
          <p class="eyebrow">Student profile</p>
          <h1>{{ currentStudent.name }}</h1>
        </div>
        <a routerLink="/app/students" class="ghost-link">Back to list</a>
      </header>

      <div class="profile-grid">
        <article class="card detail-card">
          <div class="avatar">{{ currentStudent.name.charAt(0) }}</div>
          <div>
            <h2>{{ currentStudent.name }}</h2>
            <p>{{ currentStudent.className }} • {{ currentStudent.section }}</p>
          </div>
          <dl>
            <div><dt>Roll</dt><dd>{{ currentStudent.rollNumber }}</dd></div>
            <div><dt>Admission</dt><dd>{{ currentStudent.admissionNumber }}</dd></div>
            <div><dt>Phone</dt><dd>{{ currentStudent.phone }}</dd></div>
          </dl>
        </article>

        <article class="card">
          <h3>Attendance summary</h3>
          <div class="ring" [style.--value]="currentStudent.monthlySummary?.attendancePercentage ?? 0">
            <div>{{ currentStudent.monthlySummary?.attendancePercentage ?? 0 }}%</div>
          </div>
          <p>Present: {{ currentStudent.monthlySummary?.presentDays }} | Absent: {{ currentStudent.monthlySummary?.absentDays }}</p>
        </article>
      </div>

      <article class="card">
        <h3>Recent attendance</h3>
        <ul class="list">
          <li *ngFor="let item of currentStudent.recentAttendance ?? []">
            <span>{{ item.attendanceDate | date:'mediumDate' }}</span>
            <strong>{{ item.attendanceType }}</strong>
          </li>
        </ul>
      </article>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 20px; }
      .page-header { display: flex; align-items: center; justify-content: space-between; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      h1 { margin: 0; }
      .profile-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 18px; }
      .card { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 10px 24px rgba(15,23,42,0.06); }
      .avatar { width: 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, #dbeafe, #ddd6fe); display: grid; place-items: center; font-weight: 800; }
      dl { margin: 18px 0 0; display: grid; gap: 12px; }
      dl div { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
      dt { color: #64748b; }
      .ring { --value: 0; width: 120px; height: 120px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(#4f46e5 calc(var(--value) * 1%), #e2e8f0 0); position: relative; margin: 0 auto 10px; }
      .ring::before { content: ''; position: absolute; inset: 14px; border-radius: 50%; background: white; }
      .ring div { position: relative; z-index: 1; font-weight: 800; }
      .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
      .list li { display: flex; justify-content: space-between; background: #f8fafc; padding: 10px 12px; border-radius: 10px; transition: background 0.15s ease; }
      .list li:hover { background: #eef2ff; }
      .ghost-link { color: #4f46e5; font-weight: 700; text-decoration: none; }
      @media (max-width: 640px) { .profile-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class StudentDetailComponent {
  student: StudentWithDetailsDto | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dataService: MockDataService,
  ) {
    const studentId = this.route.snapshot.paramMap.get('id');
    this.student = this.dataService.getStudents().find((item) => item.id === studentId);
  }
}
