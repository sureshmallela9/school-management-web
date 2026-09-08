import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { Student } from '../../core/models/student.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Student management</p>
          <h1>Students</h1>
        </div>
        <button type="button" class="primary-btn" (click)="openCreateDialog()">Add Student</button>
      </div>

      <div class="toolbar">
        <input
          type="search"
          placeholder="Search by name or roll number"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearch()"
          aria-label="Search students"
        />
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Class</th>
              <th>Section</th>
              <th>Parent</th>
              <th>Admission Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let student of students">
              <td>{{ student.name }}</td>
              <td>{{ student.rollNumber }}</td>
              <td>{{ student.className || student.classId }}</td>
              <td>{{ student.section || '-' }}</td>
              <td>{{ student.parentName || '-' }}</td>
              <td>{{ student.admissionNumber }}</td>
              <td class="action-cell">
                <button type="button" class="text-btn" (click)="viewStudent(student.id)">View</button>
                <button type="button" class="text-btn" (click)="editStudent(student)">Edit</button>
                <button type="button" class="danger-btn" (click)="deleteStudent(student)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button type="button" [disabled]="page === 1" (click)="changePage(page - 1)">Previous</button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button type="button" [disabled]="page === totalPages" (click)="changePage(page + 1)">Next</button>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .primary-btn, .text-btn, .danger-btn, .pagination button { border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .primary-btn { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 12px 16px; }
      .text-btn { background: #eef2ff; color: #3730a3; padding: 8px 10px; }
      .danger-btn { background: #fee2e2; color: #991b1b; padding: 8px 10px; }
      .toolbar { background: white; border-radius: 16px; padding: 14px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      input { width: 100%; border: 1px solid #dfe7f5; border-radius: 10px; padding: 12px 14px; font: inherit; }
      .table-wrap { overflow: auto; background: white; border-radius: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 14px 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
      th { background: #f8fafc; }
      tbody tr { transition: background 0.15s ease; }
      tbody tr:hover { background: #f8fafc; }
      .action-cell { display: flex; gap: 8px; flex-wrap: wrap; }
      .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; background: white; padding: 12px; border-radius: 12px; }
      .pagination button { background: #e2e8f0; padding: 8px 12px; }
      .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
      @media (max-width: 640px) { .page-header { flex-direction: column; align-items: flex-start; } }
    `,
  ],
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  searchTerm = '';
  page = 1;
  limit = 10;
  totalPages = 1;

  constructor(
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  onSearch(): void {
    this.page = 1;
    this.loadStudents();
  }

  changePage(nextPage: number): void {
    this.page = nextPage;
    this.loadStudents();
  }

  openCreateDialog(): void {
    this.router.navigateByUrl('/admin/students/create');
  }

  viewStudent(id: string): void {
    this.router.navigateByUrl(`/admin/students/${id}`);
  }

  editStudent(student: Student): void {
    this.router.navigateByUrl(`/admin/students/${student.id}/edit`);
  }

  deleteStudent(student: Student): void {
    const confirmed = window.confirm(`Delete ${student.name}? This action is permanent.`);
    if (!confirmed) {
      return;
    }

    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.studentService.deleteStudent(student.id, tenantId).subscribe({
      next: () => this.loadStudents(),
      error: (err) => {
        window.alert(err?.error?.message || err?.message || 'Unable to delete student');
        this.cdr.detectChanges();
      },
    });
  }

  private loadStudents(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.studentService.getStudents(tenantId, this.page, this.limit, this.searchTerm).subscribe({
      next: (response) => {
        this.students = response.data;
        this.totalPages = response.totalPages;
        this.cdr.detectChanges();
      },
      error: () => {
        this.students = [];
        this.cdr.detectChanges();
      },
    });
  }
}
