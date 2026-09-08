import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../attendance.service';
import { StudentService } from '../../../core/services/student.service';
import { ATTENDANCE_TYPES, AttendanceRequest } from '../attendance.model';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-attendance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance form</p>
          <h1>{{ isEditMode ? 'Edit attendance' : 'Add attendance' }}</h1>
        </div>
      </div>

      <form [formGroup]="attendanceForm" (ngSubmit)="submitForm()" class="card">
        <div class="grid">
          <label>
            <span>Student</span>
            <select formControlName="studentId" (change)="onStudentChange()">
              <option value="">Select a student</option>
              <option *ngFor="let student of students" [value]="student.id">{{ student.name }} ({{ student.rollNumber }})</option>
            </select>
          </label>
          <label>
            <span>Class ID</span>
            <input formControlName="classId" type="text" placeholder="auto-filled from student" />
          </label>
          <label>
            <span>Attendance Date</span>
            <input formControlName="attendanceDate" type="date" [max]="maxDate" />
          </label>
          <label>
            <span>Attendance Type</span>
            <select formControlName="attendanceType">
              <option value="">Select</option>
              <option *ngFor="let type of attendanceTypes" [value]="type">{{ type }}</option>
            </select>
          </label>
          <label class="full-width">
            <span>Remarks</span>
            <textarea formControlName="remarks"></textarea>
          </label>
        </div>

        <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>

        <div class="actions">
          <button type="button" class="secondary-btn" (click)="goBack()">Cancel</button>
          <button type="submit" class="primary-btn" [disabled]="attendanceForm.invalid || isSubmitting">{{ isSubmitting ? 'Saving...' : 'Save' }}</button>
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
export class AttendanceFormComponent implements OnInit {
  attendanceForm: FormGroup;
  attendanceTypes = ATTENDANCE_TYPES;
  students: Student[] = [];
  isEditMode = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  maxDate = new Date().toISOString().slice(0, 10);
  private recordId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly attendanceService: AttendanceService,
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.attendanceForm = this.fb.group({
      studentId: ['', Validators.required],
      classId: ['', Validators.required],
      attendanceDate: [this.maxDate, Validators.required],
      attendanceType: ['', Validators.required],
      remarks: [''],
    });
  }

  onStudentChange(): void {
    const student = this.students.find((s) => s.id === this.attendanceForm.value.studentId);
    if (student) {
      this.attendanceForm.patchValue({ classId: student.classId });
    }
  }

  ngOnInit(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.studentService.getStudents(tenantId, 1, 200).subscribe({
      next: (response) => {
        this.students = response.data;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.recordId = id;
    this.isEditMode = !!id;

    if (id) {
      const tenantId = this.authService.getTenantId() ?? 'tenant-001';
      this.attendanceService.getAttendanceById(id, tenantId).subscribe({
        next: (response) => {
          const record = response.data;
          if (record) {
            this.attendanceForm.patchValue({
              studentId: record.studentId,
              classId: record.classId,
              attendanceDate: record.attendanceDate,
              attendanceType: record.attendanceType,
              remarks: record.remarks,
            });
          } else {
            this.errorMessage = response.message;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Unable to load attendance record';
          this.cdr.detectChanges();
        },
      });
    }
  }

  submitForm(): void {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    const request: AttendanceRequest = { ...this.attendanceForm.value };

    const handleResponse = (response: { success: boolean; message: string }) => {
      if (!response.success) {
        this.isSubmitting = false;
        this.errorMessage = response.message;
        this.cdr.detectChanges();
        return;
      }
      this.router.navigateByUrl('/admin/attendance');
    };
    const handleError = (err?: { error?: { message?: string }; message?: string }) => {
      this.isSubmitting = false;
      this.errorMessage = err?.error?.message || err?.message || 'Unable to save attendance record';
      this.cdr.detectChanges();
    };

    if (this.isEditMode && this.recordId) {
      this.attendanceService.updateAttendance(this.recordId, request, tenantId).subscribe({ next: handleResponse, error: handleError });
      return;
    }

    this.attendanceService.createAttendance(request, tenantId).subscribe({ next: handleResponse, error: handleError });
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/attendance');
  }
}
