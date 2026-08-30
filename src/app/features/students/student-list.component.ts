import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentWithDetailsDto } from '../../core/models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Students</p>
          <h1>My children</h1>
        </div>
      </header>

      <div class="student-grid">
        <article class="student-card" *ngFor="let student of students">
          <div class="avatar">{{ student.name.charAt(0) }}</div>
          <div class="meta">
            <h2>{{ student.name }}</h2>
            <p>{{ student.className }} • {{ student.section }}</p>
            <p>Roll {{ student.rollNumber }}</p>
          </div>
          <div class="card-actions">
            <span class="status" [class.present]="student.todayStatus === 'Present'">{{ student.todayStatus }}</span>
            <a [routerLink]="['/app/students', student.id]">View profile</a>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .page-header { display: flex; align-items: center; justify-content: space-between; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      h1 { margin: 0; }
      .student-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      .student-card { background: white; border-radius: 20px; padding: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); display: grid; gap: 12px; transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .student-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,0.1); }
      .avatar { width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, #dbeafe, #e9d5ff); color: #1d4ed8; font-weight: 800; display: grid; place-items: center; }
      .meta h2 { margin: 0; }
      .meta p { margin: 4px 0 0; color: #64748b; }
      .card-actions { display: flex; align-items: center; justify-content: space-between; }
      .status { padding: 6px 10px; border-radius: 999px; font-size: 0.74rem; font-weight: 700; background: #dcfce7; color: #166534; }
      .status.present { background: #dcfce7; color: #166534; }
      a { text-decoration: none; color: #4f46e5; font-weight: 700; }
    `,
  ],
})
export class StudentListComponent {
  students: StudentWithDetailsDto[] = [];

  constructor(private readonly dataService: MockDataService) {
    this.students = this.dataService.getStudents();
  }
}
