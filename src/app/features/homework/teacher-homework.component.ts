import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HomeworkService } from '../../core/services/homework.service';
import { HomeworkDto } from '../../core/models/homework.model';

@Component({
  selector: 'app-teacher-homework',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Teacher</p>
          <h1>Homework</h1>
        </div>
      </header>

      <section class="panel">
        <h2>Assign new homework</h2>
        <form class="homework-form" (ngSubmit)="create()">
          <label>Title<input [(ngModel)]="title" name="title" required placeholder="Chapter 4 exercises" /></label>
          <label>Subject ID<input [(ngModel)]="subjectId" name="subjectId" required placeholder="subject-math" /></label>
          <label>Class ID<input [(ngModel)]="classId" name="classId" required placeholder="class-grade5" /></label>
          <label>Assigned date<input type="date" [(ngModel)]="assignedDate" name="assignedDate" required /></label>
          <label>Due date<input type="date" [(ngModel)]="dueDate" name="dueDate" required /></label>
          <label class="full">Description<textarea [(ngModel)]="description" name="description" rows="3" placeholder="Optional notes for students"></textarea></label>
          <button type="submit">Assign homework</button>
        </form>
        <p class="success" *ngIf="successMessage">{{ successMessage }}</p>
        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      </section>

      <section class="panel">
        <h2>Recently assigned</h2>
        <p class="loading" *ngIf="loading">Loading homework...</p>
        <div class="homework-list" *ngIf="!loading">
          <article class="entry" *ngFor="let item of homework">
            <div class="entry-header">
              <strong>{{ item.title }}</strong>
              <span>{{ item.status || 'Assigned' }}</span>
            </div>
            <p>{{ item.description }}</p>
            <small>{{ item.subjectName || item.subjectId }} • Due {{ item.dueDate | date:'mediumDate' }}</small>
          </article>
          <p class="empty" *ngIf="!homework.length">No homework assigned yet.</p>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .panel { background: white; border-radius: 16px; padding: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); display: grid; gap: 14px; }
      .homework-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; align-items: end; }
      .homework-form label { display: grid; gap: 6px; color: #334155; font-weight: 700; font-size: 0.85rem; }
      .homework-form .full { grid-column: 1 / -1; }
      .homework-form input, .homework-form textarea { border: 1px solid #dfe7f5; border-radius: 10px; padding: 10px 12px; font: inherit; }
      .homework-form button { border: 0; border-radius: 9px; padding: 10px 14px; background: #4f46e5; color: white; font-weight: 700; cursor: pointer; grid-column: 1 / -1; justify-self: start; }
      .success { color: #15803d; font-weight: 700; }
      .error { color: #b91c1c; font-weight: 700; }
      .loading, .empty { color: #64748b; }
      .homework-list { display: grid; gap: 12px; }
      .entry { border: 1px solid #edf2f7; border-radius: 14px; padding: 14px; }
      .entry-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .entry p { margin: 8px 0; color: #475569; }
      .entry small { color: #64748b; }
      .entry-header span { background: #eef2ff; color: #3730a3; padding: 5px 9px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
    `,
  ],
})
export class TeacherHomeworkComponent implements OnInit {
  private readonly homeworkService = inject(HomeworkService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  homework: HomeworkDto[] = [];
  loading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  title = '';
  description = '';
  subjectId = '';
  classId = '';
  assignedDate = '';
  dueDate = '';

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const teacherId = this.authService.getUserId() ?? '';
    this.loading = true;
    // this endpoint pages from 0, unlike every other paginated endpoint in this app
    this.homeworkService.listForTeacher(teacherId, 0, 20).subscribe({
      next: (response) => {
        this.homework = response.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load homework.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  create(): void {
    if (!this.title.trim() || !this.subjectId.trim() || !this.classId.trim() || !this.assignedDate || !this.dueDate) {
      return;
    }
    this.errorMessage = null;
    this.successMessage = null;
    this.homeworkService
      .create({
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        subjectId: this.subjectId.trim(),
        classId: this.classId.trim(),
        assignedDate: this.assignedDate,
        dueDate: this.dueDate,
        teacherId: this.authService.getUserId() ?? undefined,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Homework assigned.';
          this.title = '';
          this.description = '';
          this.subjectId = '';
          this.classId = '';
          this.assignedDate = '';
          this.dueDate = '';
          this.load();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || err?.message || 'Failed to assign homework.';
          this.cdr.detectChanges();
        },
      });
  }
}
