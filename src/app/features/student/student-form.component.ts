import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Student, CreateStudentRequest, UpdateStudentRequest } from '../../core/models/student.model';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { ParentService } from '../../core/services/parent.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
            <span>Class ID</span>
            <input formControlName="classId" type="text" placeholder="e.g. cls3c4d5e6-..." />
          </label>
          <label>
            <span>Class Name</span>
            <input formControlName="className" type="text" />
          </label>
          <label>
            <span>Section</span>
            <input formControlName="section" type="text" />
          </label>

          <div class="parent-section full-width">
            <div class="parent-header">
              <span>Parent</span>
              <div class="parent-toggle">
                <button type="button" [class.active]="parentMode === 'existing'" (click)="parentMode = 'existing'">Select existing</button>
                <button type="button" [class.active]="parentMode === 'new'" (click)="parentMode = 'new'">Create new</button>
              </div>
            </div>

            <label *ngIf="parentMode === 'existing'">
              <span>Existing parent</span>
              <select formControlName="parentId" (change)="onParentSelect()">
                <option value="">Select a parent</option>
                <option *ngFor="let parent of parentOptions" [value]="parent.id">{{ parent.name }}</option>
              </select>
            </label>

            <div class="new-parent-grid" *ngIf="parentMode === 'new'">
              <label>
                <span>Parent Name</span>
                <input type="text" [(ngModel)]="newParent.name" [ngModelOptions]="{ standalone: true }" />
              </label>
              <label>
                <span>Parent Email</span>
                <input type="email" [(ngModel)]="newParent.email" [ngModelOptions]="{ standalone: true }" />
              </label>
              <label>
                <span>Temporary Password</span>
                <input type="text" [(ngModel)]="newParent.password" [ngModelOptions]="{ standalone: true }" />
              </label>
              <label>
                <span>Parent Phone</span>
                <input type="text" [(ngModel)]="newParent.phone" [ngModelOptions]="{ standalone: true }" />
              </label>
              <button type="button" class="secondary-btn" [disabled]="!canCreateParent() || isCreatingParent" (click)="createParent()">
                {{ isCreatingParent ? 'Creating...' : 'Create & use this parent' }}
              </button>
              <p class="error-text" *ngIf="parentErrorMessage">{{ parentErrorMessage }}</p>
            </div>

            <p class="selected-parent" *ngIf="studentForm.value.parentId">
              Selected parent: <strong>{{ studentForm.value.parentName || studentForm.value.parentId }}</strong>
            </p>
          </div>

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
      .parent-section { display: grid; gap: 10px; background: #f8fafc; border-radius: 14px; padding: 14px; }
      .parent-header { display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: #334155; }
      .parent-toggle { display: flex; gap: 6px; }
      .parent-toggle button { border: none; background: #e2e8f0; color: #334155; padding: 8px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
      .parent-toggle button.active { background: #4f46e5; color: white; }
      .new-parent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; align-items: end; }
      .selected-parent { margin: 0; color: #166534; font-weight: 600; }
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

  parentMode: 'existing' | 'new' = 'existing';
  parentOptions: { id: string; name: string }[] = [];
  newParent = { name: '', email: '', password: '', phone: '' };
  isCreatingParent = false;
  parentErrorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly studentService: StudentService,
    private readonly parentService: ParentService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.studentForm = this.fb.group({
      name: ['', Validators.required],
      admissionNumber: ['', Validators.required],
      rollNumber: ['', Validators.required],
      classId: ['', Validators.required],
      className: ['', Validators.required],
      section: [''],
      parentId: ['', Validators.required],
      parentName: [''],
      phone: [''],
      gender: [''],
      bloodGroup: [''],
      dateOfBirth: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    // no list-parents endpoint exists on the backend - derive known parents from existing students
    this.studentService.getStudents(tenantId, 1, 200).subscribe({
      next: (response) => {
        const uniqueParents = new Map(response.data.filter((s) => s.parentId).map((s) => [s.parentId, s.parentName || s.parentId]));
        this.parentOptions = Array.from(uniqueParents, ([id, name]) => ({ id, name }));
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });

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
              classId: student.classId,
              className: student.className,
              section: student.section,
              parentId: student.parentId,
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

  onParentSelect(): void {
    const parent = this.parentOptions.find((p) => p.id === this.studentForm.value.parentId);
    this.studentForm.patchValue({ parentName: parent?.name ?? '' });
  }

  canCreateParent(): boolean {
    return !!(this.newParent.name && this.newParent.email && this.newParent.password);
  }

  createParent(): void {
    if (!this.canCreateParent()) {
      return;
    }

    this.isCreatingParent = true;
    this.parentErrorMessage = null;
    this.parentService
      .createParent({
        name: this.newParent.name,
        email: this.newParent.email,
        password: this.newParent.password,
        phone: this.newParent.phone || undefined,
      })
      .subscribe({
        next: (response) => {
          this.isCreatingParent = false;
          if (!response.success || !response.data) {
            this.parentErrorMessage = response.message || 'Unable to create parent';
            this.cdr.detectChanges();
            return;
          }
          const parent = { id: response.data.id, name: response.data.name };
          this.parentOptions = [...this.parentOptions, parent];
          this.studentForm.patchValue({ parentId: parent.id, parentName: parent.name });
          this.newParent = { name: '', email: '', password: '', phone: '' };
          this.parentMode = 'existing';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isCreatingParent = false;
          this.parentErrorMessage = err?.error?.message || err?.message || 'Unable to create parent';
          this.cdr.detectChanges();
        },
      });
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
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message || err?.message || 'Unable to update student';
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
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || err?.message || 'Unable to create student';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/students');
  }
}
