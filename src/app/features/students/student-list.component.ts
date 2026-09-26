import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Student } from '../../core/models/student.model';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header"><div><p class="eyebrow">Family</p><h1>My children</h1><p class="lede">Student information linked to your parent account.</p></div></header>
      <p class="loading" *ngIf="loading">Loading linked students…</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <div class="student-grid" *ngIf="!loading && !errorMessage">
        <article class="student-card" *ngFor="let student of students">
          <div class="avatar">{{ student.name.charAt(0) }}</div>
          <div class="meta">
            <h2>{{ student.name }}</h2>
            <p>{{ student.className || student.classId }}<span *ngIf="student.section"> · Section {{ student.section }}</span></p>
            <p>Roll {{ student.rollNumber || '—' }} · Admission {{ student.admissionNumber || '—' }}</p>
          </div>
          <a [routerLink]="['/app/students', student.id]">View full profile</a>
        </article>
        <p class="empty" *ngIf="!students.length">No children are linked to your account. Please contact the school administrator.</p>
      </div>
    </section>
  `,
  styles: [`
    .page-shell { display: grid; gap: 18px; } .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: .1em; font-size: .72rem; color: #4f46e5; font-weight: 700; }
    h1, h2, p { margin-top: 0; } h1 { margin-bottom: 6px; } .lede { color: #64748b; margin: 0; }
    .student-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap: 16px; }
    .student-card { background: white; border-radius: 18px; padding: 18px; box-shadow: 0 8px 18px rgba(15,23,42,.06); display: grid; gap: 12px; }
    .avatar { width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg,#dbeafe,#e9d5ff); color: #1d4ed8; font-weight: 800; display: grid; place-items: center; }
    .meta h2 { margin: 0; } .meta p { margin: 5px 0 0; color: #64748b; } a { text-decoration: none; color: #4f46e5; font-weight: 700; }
    .loading, .empty { color: #64748b; } .error { color: #b91c1c; font-weight: 700; }
  `],
})
export class StudentListComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  students: Student[] = [];
  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.studentService.getMyStudents(this.authService.getTenantId() ?? '', 1, 50).subscribe({
      next: (response) => { this.students = response.data || []; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => { this.errorMessage = err?.error?.message || err?.message || 'Unable to load linked students.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }
}