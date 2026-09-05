import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import {
  AcademicYear,
  ApiResponse,
  FeeAssignment,
  AcademicYearRequest,
  ClassFeeAssignmentRequest,
  FeeCategory,
  FeeCategoryRequest,
  FeeDashboard,
  FeeFilters,
  FeeReceipt,
  FeeReceiptRequest,
  FeeStructure,
  FeeStructureRequest,
  FeeTerm,
  FeeTermRequest,
  LegacyFee,
  PaginatedResponse,
  StudentFeeLedger,
  StudentFeeAssignmentRequest,
} from '../models/fee.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FeeService {
  private readonly adminBase = `${API_BASE_URL}/api/admin/fee`;
  private readonly authBase = `${API_BASE_URL}/api`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private tenantId(tenantId?: string): string {
    return tenantId || this.authService.getTenantId() || '';
  }

  private params(values: Record<string, string | number | undefined>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
      }
    }
    return params;
  }

  getDashboard(tenantId?: string, academicYearId?: string): Observable<ApiResponse<FeeDashboard>> {
    return this.http.get<ApiResponse<FeeDashboard>>(`${this.adminBase}/dashboard`, {
      params: this.params({ tenantId: this.tenantId(tenantId), academicYearId }),
    });
  }

  getLedger(filters: FeeFilters = {}, page = 1, limit = 20, tenantId?: string): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.adminBase}/ledger`, {
      params: this.params({ tenantId: this.tenantId(tenantId), ...filters, page, limit }),
    });
  }

  getStudentLedger(studentId: string, filters: FeeFilters = {}, page = 1, limit = 20, tenantId?: string): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.adminBase}/ledger/${studentId}`, {
      params: this.params({ tenantId: this.tenantId(tenantId), ...filters, page, limit }),
    });
  }

  getReceipts(studentId?: string, page = 1, limit = 10, tenantId?: string): Observable<PaginatedResponse<FeeReceipt>> {
    return this.http.get<PaginatedResponse<FeeReceipt>>(`${this.adminBase}/receipts`, {
      params: this.params({ tenantId: this.tenantId(tenantId), studentId, page, limit }),
    });
  }

  getAdminFees(status?: string, page = 1, limit = 10, tenantId?: string): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.authBase}/admin/fees`, {
      params: this.params({ tenantId: this.tenantId(tenantId), status, page, limit }),
    });
  }

  getParentSummary(studentId: string, academicYearId?: string, page = 1, limit = 20, tenantId?: string): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.authBase}/parent/fee/summary`, {
      params: this.params({ tenantId: this.tenantId(tenantId), studentId, academicYearId, page, limit }),
    });
  }

  getParentReceipts(studentId: string, page = 1, limit = 10, tenantId?: string): Observable<PaginatedResponse<FeeReceipt>> {
    return this.http.get<PaginatedResponse<FeeReceipt>>(`${this.authBase}/parent/fee/receipts/${studentId}`, {
      params: this.params({ tenantId: this.tenantId(tenantId), page, limit }),
    });
  }

  getParentLegacyFees(studentId: string, tenantId?: string): Observable<ApiResponse<LegacyFee[]>> {
    return this.http.get<ApiResponse<LegacyFee[]>>(`${this.authBase}/parent/students/${studentId}/fees`, {
      params: this.params({ tenantId: this.tenantId(tenantId) }),
    });
  }

  getTeacherSummary(classId: string, academicYearId?: string, page = 1, limit = 20, tenantId?: string): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.authBase}/teacher/fee/summary`, {
      params: this.params({ tenantId: this.tenantId(tenantId), classId, academicYearId, page, limit }),
    });
  }

  getAcademicYears(page = 1, limit = 10, tenantId?: string): Observable<PaginatedResponse<AcademicYear>> {
    return this.http.get<PaginatedResponse<AcademicYear>>(`${this.adminBase}/academic-years`, {
      params: this.params({ tenantId: this.tenantId(tenantId), page, limit }),
    });
  }

  getAcademicYear(id: string, tenantId?: string): Observable<ApiResponse<AcademicYear>> {
    return this.http.get<ApiResponse<AcademicYear>>(`${this.adminBase}/academic-years/${id}`, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  createAcademicYear(request: AcademicYearRequest, tenantId?: string): Observable<ApiResponse<AcademicYear>> {
    return this.http.post<ApiResponse<AcademicYear>>(`${this.adminBase}/academic-years`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  updateAcademicYear(id: string, request: AcademicYearRequest, tenantId?: string): Observable<ApiResponse<AcademicYear>> {
    return this.http.put<ApiResponse<AcademicYear>>(`${this.adminBase}/academic-years/${id}`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  deactivateAcademicYear(id: string, tenantId?: string): Observable<ApiResponse<AcademicYear>> {
    return this.http.patch<ApiResponse<AcademicYear>>(`${this.adminBase}/academic-years/${id}/deactivate`, {}, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  getFeeCategories(tenantId?: string): Observable<ApiResponse<FeeCategory[]>> {
    return this.http.get<ApiResponse<FeeCategory[]>>(`${this.adminBase}/categories`, {
      params: this.params({ tenantId: this.tenantId(tenantId) }),
    });
  }

  getFeeCategory(id: string, tenantId?: string): Observable<ApiResponse<FeeCategory>> {
    return this.http.get<ApiResponse<FeeCategory>>(`${this.adminBase}/categories/${id}`, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  createFeeCategory(request: FeeCategoryRequest, tenantId?: string): Observable<ApiResponse<FeeCategory>> {
    return this.http.post<ApiResponse<FeeCategory>>(`${this.adminBase}/categories`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  updateFeeCategory(id: string, request: FeeCategoryRequest, tenantId?: string): Observable<ApiResponse<FeeCategory>> {
    return this.http.put<ApiResponse<FeeCategory>>(`${this.adminBase}/categories/${id}`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  deleteFeeCategory(id: string, tenantId?: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.adminBase}/categories/${id}`, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  getFeeTerms(academicYearId: string, tenantId?: string): Observable<ApiResponse<FeeTerm[]>> {
    return this.http.get<ApiResponse<FeeTerm[]>>(`${this.adminBase}/terms`, {
      params: this.params({ academicYearId, tenantId: this.tenantId(tenantId) }),
    });
  }

  getFeeTerm(id: string, tenantId?: string): Observable<ApiResponse<FeeTerm>> {
    return this.http.get<ApiResponse<FeeTerm>>(`${this.adminBase}/terms/${id}`, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  createFeeTerm(request: FeeTermRequest, tenantId?: string): Observable<ApiResponse<FeeTerm>> {
    return this.http.post<ApiResponse<FeeTerm>>(`${this.adminBase}/terms`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  updateFeeTerm(id: string, request: FeeTermRequest, tenantId?: string): Observable<ApiResponse<FeeTerm>> {
    return this.http.put<ApiResponse<FeeTerm>>(`${this.adminBase}/terms/${id}`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  getFeeStructures(filters: { academicYearId?: string; classId?: string; feeCategoryId?: string } = {}, page = 1, limit = 20, tenantId?: string): Observable<PaginatedResponse<FeeStructure>> {
    return this.http.get<PaginatedResponse<FeeStructure>>(`${this.adminBase}/structures`, {
      params: this.params({ tenantId: this.tenantId(tenantId), ...filters, page, limit }),
    });
  }

  getFeeStructure(id: string, tenantId?: string): Observable<ApiResponse<FeeStructure>> {
    return this.http.get<ApiResponse<FeeStructure>>(`${this.adminBase}/structures/${id}`, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  createFeeStructure(request: FeeStructureRequest, tenantId?: string): Observable<ApiResponse<FeeStructure>> {
    return this.http.post<ApiResponse<FeeStructure>>(`${this.adminBase}/structures`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  updateFeeStructure(id: string, request: FeeStructureRequest, tenantId?: string): Observable<ApiResponse<FeeStructure>> {
    return this.http.put<ApiResponse<FeeStructure>>(`${this.adminBase}/structures/${id}`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  deleteFeeStructure(id: string, tenantId?: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.adminBase}/structures/${id}`, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  getAssignments(filters: { studentId?: string; classId?: string } = {}, tenantId?: string): Observable<ApiResponse<FeeAssignment[]>> {
    return this.http.get<ApiResponse<FeeAssignment[]>>(`${this.adminBase}/assignments`, {
      params: this.params({ tenantId: this.tenantId(tenantId), ...filters }),
    });
  }

  assignToStudent(request: StudentFeeAssignmentRequest, tenantId?: string): Observable<ApiResponse<FeeAssignment>> {
    return this.http.post<ApiResponse<FeeAssignment>>(`${this.adminBase}/assignments/student`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  assignToClass(request: ClassFeeAssignmentRequest, tenantId?: string): Observable<ApiResponse<FeeAssignment[]>> {
    return this.http.post<ApiResponse<FeeAssignment[]>>(`${this.adminBase}/assignments/class`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  deleteAssignment(id: string, tenantId?: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.adminBase}/assignments/${id}`, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  createReceipt(request: FeeReceiptRequest, tenantId?: string): Observable<ApiResponse<FeeReceipt>> {
    return this.http.post<ApiResponse<FeeReceipt>>(`${this.adminBase}/receipts`, request, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  getReceipt(id: string, tenantId?: string): Observable<ApiResponse<FeeReceipt>> {
    return this.http.get<ApiResponse<FeeReceipt>>(`${this.adminBase}/receipts/${id}`, { params: this.params({ tenantId: this.tenantId(tenantId) }) });
  }

  getAdminFeeReport(type: 'paid' | 'outstanding' | 'overdue', filters: { academicYearId?: string; classId?: string } = {}, page = 1, limit = 20, tenantId?: string): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.adminBase}/reports/${type}`, {
      params: this.params({ tenantId: this.tenantId(tenantId), ...filters, page, limit }),
    });
  }

  getClassFeeReport(classId: string, academicYearId?: string, page = 1, limit = 20, tenantId?: string): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.adminBase}/reports/class/${classId}`, {
      params: this.params({ tenantId: this.tenantId(tenantId), academicYearId, page, limit }),
    });
  }

  getStudentFeeReport(studentId: string, academicYearId?: string, tenantId?: string): Observable<ApiResponse<{ studentId: string; studentName?: string; totalAmount: number; paidAmount: number; outstandingAmount: number; ledgerEntries: StudentFeeLedger[]; receipts: FeeReceipt[] }>> {
    return this.http.get<ApiResponse<{ studentId: string; studentName?: string; totalAmount: number; paidAmount: number; outstandingAmount: number; ledgerEntries: StudentFeeLedger[]; receipts: FeeReceipt[] }>>(`${this.adminBase}/reports/student/${studentId}`, {
      params: this.params({ tenantId: this.tenantId(tenantId), academicYearId }),
    });
  }
}
