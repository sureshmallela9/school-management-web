import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Student } from '../../core/models/student.model';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell" *ngIf="student; else loading">
      <div class="page-header">
        <div>
          <p class="eyebrow">Student profile</p>
          <h1>{{ student.name }}</h1>
        </div>
      </div>

      <div class="grid">
        <article class="card">
          <h2>Basic Details</h2>
          <dl>
            <div><dt>Name</dt><dd>{{ student.name }}</dd></div>
            <div><dt>Roll Number</dt><dd>{{ student.rollNumber }}</dd></div>
            <div><dt>Admission Number</dt><dd>{{ student.admissionNumber }}</dd></div>
            <div><dt>Class</dt><dd>{{ student.className || student.classId }}</dd></div>
            <div><dt>Section</dt><dd>{{ student.section || '-' }}</dd></div>
            <div><dt>Parent</dt><dd>{{ student.parentName || student.parentId }}</dd></div>
          </dl>
        </article>

        <article class="card">
          <h2>Contact & Demographics</h2>
          <dl>
            <div><dt>Phone</dt><dd>{{ student.phone || '-' }}</dd></div>
            <div><dt>Gender</dt><dd>{{ student.gender || '-' }}</dd></div>
            <div><dt>Blood Group</dt><dd>{{ student.bloodGroup || '-' }}</dd></div>
            <div><dt>Date of Birth</dt><dd>{{ student.dateOfBirth || '-' }}</dd></div>
            <div><dt>Address</dt><dd>{{ student.address || '-' }}</dd></div>
          </dl>
        </article>
      </div>
    </section>

    <ng-template #loading>
      <p *ngIf="!errorMessage">Loading student…</p>
      <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>
    </ng-template>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
      .card { background: white; border-radius: 20px; padding: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1); }
      dl { display: grid; gap: 12px; margin: 0; }
      dl div { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid #edf2f7; padding-bottom: 8px; border-radius: 8px; transition: background 0.15s ease; }
      dl div:hover { background: #f8fafc; }
      dt { color: #64748b; }
      dd { margin: 0; font-weight: 600; text-align: right; }
      .error-text { color: #b91c1c; font-weight: 600; }
    `,
  ],
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  errorMessage: string | null = null;

  constructor(
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.studentService.getStudentById(id, tenantId).subscribe({
      next: (response) => {
        this.student = response.data ?? null;
        if (!this.student) {
          this.errorMessage = response.message || 'Student not found';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.student = null;
        this.errorMessage = err?.error?.message || err?.message || 'Unable to load student';
        this.cdr.detectChanges();
      },
    });
  }
}
