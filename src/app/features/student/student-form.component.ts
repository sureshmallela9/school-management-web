import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Student, CreateStudentRequest, UpdateStudentRequest } from '../../core/models/student.model';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Student form</p>
          <h1>{{ isEditMode ? 'Edit student' : 'Add student' }}</h1>
        </div>
      </div>

      <form [formGroup]="studentForm" (ngSubmit)="submitForm()" class="card">
        <div class="grid">
          <label>
            <span>Name</span>
            <input formControlName="name" type="text" />
          </label>
          <label>
            <span>Admission Number</span>
            <input formControlName="admissionNumber" type="text" />
          </label>
          <label>
            <span>Roll Number</span>
            <input formControlName="rollNumber" type="text" />
          </label>
          <label>
            <span>Class Name</span>
            <input formControlName="className" type="text" />
          </label>
          <label>
            <span>Section</span>
            <input formControlName="section" type="text" />
          </label>
          <label>
            <span>Parent Name</span>
            <input formControlName="parentName" type="text" />
          </label>
          <label>
            <span>Phone</span>
            <input formControlName="phone" type="text" />
          </label>
          <label>
            <span>Gender</span>
            <select formControlName="gender">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label>
            <span>Blood Group</span>
            <input formControlName="bloodGroup" type="text" />
          </label>
          <label>
            <span>Date of Birth</span>
            <input formControlName="dateOfBirth" type="date" />
          </label>
          <label class="full-width">
            <span>Address</span>
            <textarea formControlName="address"></textarea>
          </label>
        </div>

        <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>

        <div class="actions">
          <button type="button" class="secondary-btn" (click)="goBack()">Cancel</button>
          <button type="submit" class="primary-btn" [disabled]="studentForm.invalid || isSubmitting">{{ isSubmitting ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .card { background: white; border-radius: 20px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); padding: 20px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
      label { display: grid; gap: 8px; font-weight: 600; color: #334155; }
      input, select, textarea { width: 100%; border: 1px solid #dfe7f5; border-radius: 10px; padding: 12px 14px; font: inherit; resize: vertical; }
      .full-width { grid-column: 1 / -1; }
      .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
      .primary-btn, .secondary-btn { border: none; border-radius: 10px; padding: 12px 16px; font-weight: 700; cursor: pointer; }
      .primary-btn { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; }
      .secondary-btn { background: #e2e8f0; color: #0f172a; }
      .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .error-text { color: #b91c1c; font-weight: 600; margin: 14px 0 0; }
    `,
  ],
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  private studentId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.studentForm = this.fb.group({
      name: ['', Validators.required],
      admissionNumber: ['', Validators.required],
      rollNumber: ['', Validators.required],
      className: ['', Validators.required],
      section: [''],
      parentName: [''],
      phone: [''],
      gender: [''],
      bloodGroup: [''],
      dateOfBirth: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.studentId = id;
    this.isEditMode = !!id;

    if (id) {
      const tenantId = this.authService.getTenantId() ?? 'tenant-001';
      this.studentService.getStudentById(id, tenantId).subscribe({
        next: (response) => {
          const student = response.data;
          if (student) {
            this.studentForm.patchValue({
              name: student.name,
              admissionNumber: student.admissionNumber,
              rollNumber: student.rollNumber,
              className: student.className,
              section: student.section,
              parentName: student.parentName,
              phone: student.phone,
              gender: student.gender,
              bloodGroup: student.bloodGroup,
              dateOfBirth: student.dateOfBirth,
              address: student.address,
            });
          }
          this.cdr.detectChanges();
        },
      });
    }
  }

  submitForm(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    const payload = {
      ...this.studentForm.value,
      tenantId,
      classId: this.studentForm.value.className?.toLowerCase().replace(/\s+/g, '-') || 'class-1',
      parentId: this.authService.getUserId() ?? 'parent-1',
    };

    if (this.isEditMode && this.studentId) {
      const request: UpdateStudentRequest = {
        ...payload,
      };

      this.studentService.updateStudent(this.studentId, request, tenantId).subscribe({
        next: (response) => {
          if (!response.success) {
            this.isSubmitting = false;
            this.errorMessage = response.message || 'Unable to update student';
            this.cdr.detectChanges();
            return;
          }
          this.router.navigateByUrl('/admin/students');
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Unable to update student';
          this.cdr.detectChanges();
        },
      });
      return;
    }

    const request: CreateStudentRequest = {
      ...payload,
    };

    this.studentService.createStudent(request).subscribe({
      next: (response) => {
        if (!response.success) {
          this.isSubmitting = false;
          this.errorMessage = response.message || 'Unable to create student';
          this.cdr.detectChanges();
          return;
        }
        this.router.navigateByUrl('/admin/students');
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Unable to create student';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/students');
  }
}
