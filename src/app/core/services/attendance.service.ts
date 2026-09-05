import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  AttendanceAudit,
  AttendanceDashboard,
  AttendanceFilters,
  AttendanceRecord,
  AttendanceRequest,
  AttendanceSummary,
  AuditFilters,
  PaginatedResponse,
  YearlySummary,
} from '../models/attendance.model';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api-config';

const V1 = `${API_BASE_URL}/api/v1`;

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private getTenantId(): string {
    return this.authService.getTenantId() ?? 'tenant-001';
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

  // ---------- Admin ----------

  getAttendanceList(filters: AttendanceFilters, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: this.getTenantId(), ...filters, page, limit });
    return this.http.get<PaginatedResponse<AttendanceRecord>>(`${V1}/admin/attendance`, { params });
  }

  getAttendanceById(id: string, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId() });
    return this.http.get<ApiResponse<AttendanceRecord>>(`${V1}/admin/attendance/${id}`, { params });
  }

  createAttendance(request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId() });
    return this.http.post<ApiResponse<AttendanceRecord>>(`${V1}/admin/attendance`, request, { params });
  }

  updateAttendance(id: string, request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId() });
    return this.http.put<ApiResponse<AttendanceRecord>>(`${V1}/admin/attendance/${id}`, request, { params });
  }

  deleteAttendance(id: string, tenantId: string): Observable<ApiResponse<null>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId() });
    return this.http.delete<ApiResponse<null>>(`${V1}/admin/attendance/${id}`, { params });
  }

  getDashboard(tenantId: string, academicYearId?: string): Observable<ApiResponse<AttendanceDashboard>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), academicYearId });
    return this.http.get<ApiResponse<AttendanceDashboard>>(`${V1}/admin/attendance/dashboard`, { params });
  }

  recalculateSummary(studentId: string, month: number, year: number, tenantId: string): Observable<ApiResponse<AttendanceSummary>> {
    const params = this.params({ studentId, month, year, tenantId: tenantId || this.getTenantId() });
    return this.http.post<ApiResponse<AttendanceSummary>>(`${V1}/admin/attendance/summary/recalculate`, null, { params });
  }

  getAuditTrail(tenantId: string, filters: AuditFilters, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceAudit>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), ...filters, page, limit });
    return this.http.get<PaginatedResponse<AttendanceAudit>>(`${V1}/admin/attendance/audit`, { params });
  }

  // ---------- Reports ----------

  getDailyReport(tenantId: string, date: string, classId?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), attendanceDate: date, classId, page, limit });
    return this.http.get<PaginatedResponse<AttendanceRecord>>(`${V1}/admin/attendance/report/daily`, { params });
  }

  getMonthlyReport(tenantId: string, month: number, year: number, classId?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceSummary>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), month, year, classId, page, limit });
    return this.http.get<PaginatedResponse<AttendanceSummary>>(`${V1}/admin/attendance/report/monthly`, { params });
  }

  getYearlyReport(tenantId: string, year: number, classId?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceSummary>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), year, classId, page, limit });
    return this.http.get<PaginatedResponse<AttendanceSummary>>(`${V1}/admin/attendance/report/yearly`, { params });
  }

  getClassReport(classId: string, tenantId: string, fromDate?: string, toDate?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), fromDate, toDate, page, limit });
    return this.http.get<PaginatedResponse<AttendanceRecord>>(`${V1}/admin/attendance/report/class/${classId}`, { params });
  }

  getStudentReport(studentId: string, tenantId: string, fromDate?: string, toDate?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), fromDate, toDate, page, limit });
    return this.http.get<PaginatedResponse<AttendanceRecord>>(`${V1}/admin/attendance/report/student/${studentId}`, { params });
  }

  getLowAttendanceReport(tenantId: string, month: number, year: number, threshold = 75, classId?: string, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceSummary>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), threshold, month, year, classId, page, limit });
    return this.http.get<PaginatedResponse<AttendanceSummary>>(`${V1}/admin/attendance/report/low-attendance`, { params });
  }

  getPercentageReport(tenantId: string, month: number, year: number, classId?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceSummary>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), classId, month, year, page, limit });
    return this.http.get<PaginatedResponse<AttendanceSummary>>(`${V1}/admin/attendance/report/percentage`, { params });
  }

  // ---------- Teacher ----------

  markAttendance(request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId() });
    return this.http.post<ApiResponse<AttendanceRecord>>(`${V1}/teacher/attendance/mark`, request, { params });
  }

  updateTeacherAttendance(id: string, request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId() });
    return this.http.put<ApiResponse<AttendanceRecord>>(`${V1}/teacher/attendance/${id}`, request, { params });
  }

  getClassAttendance(classId: string, date: string, tenantId: string): Observable<ApiResponse<AttendanceRecord[]>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), attendanceDate: date });
    return this.http.get<ApiResponse<AttendanceRecord[]>>(`${V1}/teacher/attendance/class/${classId}`, { params });
  }

  getStudentHistory(studentId: string, tenantId: string, fromDate?: string, toDate?: string, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), fromDate, toDate, page, limit });
    return this.http.get<PaginatedResponse<AttendanceRecord>>(`${V1}/teacher/attendance/student/${studentId}`, { params });
  }

  getTodayAttendance(tenantId: string): Observable<ApiResponse<AttendanceRecord[]>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId() });
    return this.http.get<ApiResponse<AttendanceRecord[]>>(`${V1}/teacher/attendance/today`, { params });
  }

  // ---------- Parent ----------

  getChildAttendance(studentId: string, tenantId: string, fromDate?: string, toDate?: string, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceRecord>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), studentId, fromDate, toDate, page, limit });
    return this.http.get<PaginatedResponse<AttendanceRecord>>(`${V1}/parent/attendance`, { params });
  }

  getChildMonthlySummary(studentId: string, month: number, year: number, tenantId: string): Observable<ApiResponse<AttendanceSummary>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), studentId, month, year });
    return this.http.get<ApiResponse<AttendanceSummary>>(`${V1}/parent/attendance/monthly`, { params });
  }

  getChildYearlySummary(studentId: string, year: number, tenantId: string): Observable<ApiResponse<YearlySummary>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), studentId, year });
    return this.http.get<ApiResponse<YearlySummary>>(`${V1}/parent/attendance/yearly`, { params });
  }

  getChildCurrentSummary(studentId: string, tenantId: string): Observable<ApiResponse<AttendanceSummary>> {
    const params = this.params({ tenantId: tenantId || this.getTenantId(), studentId });
    return this.http.get<ApiResponse<AttendanceSummary>>(`${V1}/parent/attendance/summary`, { params });
  }
}
