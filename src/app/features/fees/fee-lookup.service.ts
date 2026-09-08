import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../core/services/auth.service';
import { FeeService } from './fees.service';
import { FeeStructure } from './fees.model';

interface StudentLookupEntry {
  name: string;
  admissionNumber?: string;
  className: string;
  classId: string;
}

/**
 * Client-side ID -> name resolution cache for the Fee module.
 *
 * Most /api/admin/fee/** endpoints return only foreign-key IDs (studentId, classId,
 * academicYearId, feeCategoryId, feeTermId, feeStructureId) with no nested names. This service
 * pre-fetches the reference data once per tenant session and resolves IDs to display names in
 * the view layer, avoiding an HTTP call per table row.
 *
 * ADMIN-ONLY: every source call here (/api/admin/students, /api/admin/fee/academic-years,
 * /categories, /structures, /terms) requires the ADMIN role on this backend. Do NOT use this
 * service from parent/teacher components - they will get 403s. Parent/teacher screens must keep
 * resolving names from their own-scoped endpoints only (e.g. the Student objects already returned
 * by /api/parent/my-students carry their own className).
 */
@Injectable({ providedIn: 'root' })
export class FeeLookupService {
  private readonly studentService = inject(StudentService);
  private readonly feeService = inject(FeeService);
  private readonly authService = inject(AuthService);

  private students = new Map<string, StudentLookupEntry>();
  private academicYears = new Map<string, string>();
  private feeCategories = new Map<string, string>();
  private feeTerms = new Map<string, string>();
  private feeStructures = new Map<string, FeeStructure>();
  private loadedForTenant: string | null = null;

  /** Call once before rendering any fee list; subsequent calls for the same tenant are a no-op. */
  loadAll(tenantId?: string): Observable<void> {
    const tenant = tenantId || this.authService.getTenantId() || '';
    if (this.loadedForTenant === tenant) {
      return of(void 0);
    }

    return forkJoin({
      students: this.studentService.getStudents(tenant, 1, 1000),
      academicYears: this.feeService.getAcademicYears(1, 100, tenant),
      categories: this.feeService.getFeeCategories(tenant),
      structures: this.feeService.getFeeStructures({}, 1, 1000, tenant),
    }).pipe(
      tap(({ students, academicYears, categories, structures }) => {
        this.students.clear();
        (students.data || []).forEach((s) => {
          this.students.set(s.id, {
            name: s.name,
            admissionNumber: s.admissionNumber,
            className: `${s.className ?? ''} ${s.section ?? ''}`.trim() || s.classId,
            classId: s.classId,
          });
        });

        this.academicYears.clear();
        (academicYears.data || []).forEach((y) => this.academicYears.set(y.id, y.name));

        this.feeCategories.clear();
        (categories.data || []).forEach((c) => this.feeCategories.set(c.id, c.name));

        this.feeStructures.clear();
        (structures.data || []).forEach((s) => this.feeStructures.set(s.id, s));
      }),
      // fee terms are scoped per academic year - fetch each year's terms in parallel, then merge
      switchMap(({ academicYears }) => {
        const yearIds = (academicYears.data || []).map((y) => y.id);
        this.feeTerms.clear();
        if (!yearIds.length) {
          this.loadedForTenant = tenant;
          return of(void 0);
        }
        return forkJoin(yearIds.map((id) => this.feeService.getFeeTerms(id, tenant))).pipe(
          map((termResponses) => {
            termResponses.forEach((response) => (response.data || []).forEach((t) => this.feeTerms.set(t.id, t.label)));
            this.loadedForTenant = tenant;
          }),
        );
      }),
    );
  }

  studentName(id?: string | null): string {
    if (!id) return '-';
    return this.students.get(id)?.name ?? id;
  }

  /** Every student in the tenant, for populating real dropdowns instead of free-text GUID entry. */
  studentOptions(): { id: string; label: string }[] {
    return [...this.students.entries()]
      .map(([id, entry]) => ({ id, label: `${entry.name} (${entry.className})` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /** Distinct classes derived from the student roster (there is no separate classes endpoint). */
  classOptions(): { id: string; label: string }[] {
    const seen = new Map<string, string>();
    this.students.forEach((entry) => {
      if (entry.classId && !seen.has(entry.classId)) {
        seen.set(entry.classId, entry.className);
      }
    });
    return [...seen.entries()].map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
  }

  admissionNumber(id?: string | null): string {
    if (!id) return '-';
    return this.students.get(id)?.admissionNumber ?? '-';
  }

  /** Resolves a classId to "className section"; falls back to deriving from a student's own classId. */
  className(id?: string | null): string {
    if (!id) return '-';
    const direct = [...this.students.values()].find((s) => s.classId === id);
    return direct?.className ?? id;
  }

  academicYearName(id?: string | null): string {
    if (!id) return '-';
    return this.academicYears.get(id) ?? id;
  }

  feeCategoryNameById(id?: string | null): string {
    if (!id) return '-';
    return this.feeCategories.get(id) ?? id;
  }

  feeTermLabelById(id?: string | null): string {
    if (!id) return '-';
    return this.feeTerms.get(id) ?? id;
  }

  feeCategoryNameByStructure(structureId?: string | null): string {
    if (!structureId) return '-';
    const structure = this.feeStructures.get(structureId);
    return structure ? this.feeCategoryNameById(structure.feeCategoryId) : structureId;
  }

  feeTermLabelByStructure(structureId?: string | null): string {
    if (!structureId) return '-';
    const structure = this.feeStructures.get(structureId);
    return structure ? this.feeTermLabelById(structure.feeTermId) : structureId;
  }

  /** Short "Category · Term" summary for a fee structure, used on assignment rows. */
  structureSummary(structureId?: string | null): string {
    if (!structureId) return '-';
    const structure = this.feeStructures.get(structureId);
    if (!structure) return structureId;
    return `${this.feeCategoryNameById(structure.feeCategoryId)} · ${this.feeTermLabelById(structure.feeTermId)}`;
  }

  /** Every fee structure, for populating a real dropdown instead of free-text GUID entry. */
  structureOptions(): { id: string; label: string }[] {
    return [...this.feeStructures.entries()]
      .map(([id, structure]) => ({
        id,
        label: `${this.className(structure.classId)} · ${this.feeCategoryNameById(structure.feeCategoryId)} · ${this.feeTermLabelById(structure.feeTermId)} · ₹${structure.amount}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
}
