import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
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

const STUDENT_DIRECTORY: Record<string, { name: string; classId: string; className: string }> = {
  'student-1': { name: 'Aisha Sharma', classId: 'class-5', className: 'Grade 5' },
  'student-2': { name: 'Rohan Sharma', classId: 'class-3', className: 'Grade 3' },
  'student-3': { name: 'Meera Nair', classId: 'class-11', className: 'Grade 11' },
};

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly records: AttendanceRecord[] = [
    this.buildRecord('att-1', 'student-1', '2026-08-27', 'PRESENT', 'Attended class on time.'),
    this.buildRecord('att-2', 'student-1', '2026-08-26', 'LATE', 'Reached 12 minutes late.'),
    this.buildRecord('att-3', 'student-1', '2026-08-25', 'ABSENT', 'Not feeling well.'),
    this.buildRecord('att-4', 'student-2', '2026-08-27', 'PRESENT', null),
    this.buildRecord('att-5', 'student-2', '2026-08-26', 'PRESENT', null),
    this.buildRecord('att-6', 'student-2', '2026-08-25', 'ABSENT', 'Family function.'),
    this.buildRecord('att-7', 'student-3', '2026-08-27', 'LEAVE', 'Approved medical leave.'),
    this.buildRecord('att-8', 'student-3', '2026-08-26', 'PRESENT', null),
  ];

  private readonly auditLogs: AttendanceAudit[] = this.records.map((record, index) => ({
    id: `audit-${index + 1}`,
    attendanceId: record.id,
    action: 'CREATE',
    changedBy: record.markedBy,
    changedAt: record.markedAt,
    previousValue: null,
    newValue: record.attendanceType,
  }));

  constructor(private readonly authService: AuthService) {}

  private getTenantId(): string {
    return this.authService.getTenantId() ?? 'tenant-001';
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private buildRecord(id: string, studentId: string, date: string, type: AttendanceRecord['attendanceType'], remarks: string | null): AttendanceRecord {
    const student = STUDENT_DIRECTORY[studentId];
    return {
      id,
      studentId,
      studentName: student?.name,
      teacherId: 'user-teacher-example-com',
      classId: student?.classId ?? 'class-1',
      className: student?.className,
      sectionId: null,
      academicYearId: null,
      attendanceDate: date,
      attendanceType: type,
      remarks,
      markedAt: `${date}T09:00:00`,
      markedBy: 'user-teacher-example-com',
      status: 'ACTIVE',
      tenantId: 'tenant-001',
      version: 1,
    };
  }

  private paginate<T>(data: T[], page: number, limit: number): PaginatedResponse<T> {
    const start = (page - 1) * limit;
    const slice = data.slice(start, start + limit);
    return {
      success: true,
      data: slice,
      message: 'Retrieved successfully',
      total: data.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(data.length / limit)),
    };
  }

  private buildSummary(studentId: string, month: number, year: number, tenantId: string): AttendanceSummary {
    const student = STUDENT_DIRECTORY[studentId];
    const monthRecords = this.records.filter((record) => {
      const [recordYear, recordMonth] = record.attendanceDate.split('-').map(Number);
      return record.studentId === studentId && record.tenantId === tenantId && recordMonth === month && recordYear === year;
    });

    const counts = {
      presentDays: monthRecords.filter((r) => r.attendanceType === 'PRESENT').length,
      absentDays: monthRecords.filter((r) => r.attendanceType === 'ABSENT').length,
      lateDays: monthRecords.filter((r) => r.attendanceType === 'LATE').length,
      leaveDays: monthRecords.filter((r) => r.attendanceType === 'LEAVE').length,
      halfDays: monthRecords.filter((r) => r.attendanceType === 'HALF_DAY').length,
      medicalLeaveDays: monthRecords.filter((r) => r.attendanceType === 'MEDICAL_LEAVE').length,
    };
    const workingDays = monthRecords.filter((r) => r.attendanceType !== 'HOLIDAY').length;
    const attendedDays = counts.presentDays + counts.lateDays + counts.halfDays * 0.5;
    const attendancePercentage = workingDays > 0 ? Math.round((attendedDays / workingDays) * 100) : 0;

    return {
      studentId,
      studentName: student?.name,
      monthVal: month,
      yearVal: year,
      workingDays,
      attendancePercentage,
      ...counts,
    };
  }

  private studentIdsForTenant(tenantId: string, classId?: string): string[] {
    const ids = new Set(this.records.filter((r) => r.tenantId === tenantId && (!classId || r.classId === classId)).map((r) => r.studentId));
    return Array.from(ids);
  }

  // ---------- Admin ----------

  getAttendanceList(filters: AttendanceFilters, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceRecord>> {
    const tenantId = this.getTenantId();
    const filtered = this.records.filter((record) => {
      if (record.tenantId !== tenantId) return false;
      if (filters.classId && record.classId !== filters.classId) return false;
      if (filters.studentId && record.studentId !== filters.studentId) return false;
      if (filters.attendanceDate && record.attendanceDate !== filters.attendanceDate) return false;
      if (filters.attendanceType && record.attendanceType !== filters.attendanceType) return false;
      return true;
    });

    return of(this.paginate(filtered, page, limit)).pipe(delay(150));
  }

  getAttendanceById(id: string, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const record = this.records.find((r) => r.id === id && r.tenantId === (tenantId || this.getTenantId()));
    return of(
      record
        ? { success: true, data: record, message: 'Attendance record retrieved successfully', error: null, code: null }
        : { success: false, data: null, message: 'Attendance record not found', error: 'Attendance record not found', code: 404 },
    ).pipe(delay(120));
  }

  createAttendance(request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const resolvedTenantId = tenantId || this.getTenantId();

    if (new Date(request.attendanceDate) > new Date(this.today())) {
      return of({ success: false, data: null, message: 'Attendance date cannot be in the future', error: 'Future date not allowed', code: 422 }).pipe(delay(120));
    }

    const duplicate = this.records.some(
      (r) => r.studentId === request.studentId && r.attendanceDate === request.attendanceDate && r.tenantId === resolvedTenantId,
    );
    if (duplicate) {
      return of({ success: false, data: null, message: 'Attendance already marked for this student today', error: 'Duplicate record', code: 409 }).pipe(delay(120));
    }

    const student = STUDENT_DIRECTORY[request.studentId];
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId: request.studentId,
      studentName: student?.name,
      teacherId: request.teacherId ?? null,
      classId: request.classId,
      className: student?.className,
      sectionId: request.sectionId ?? null,
      academicYearId: request.academicYearId ?? null,
      attendanceDate: request.attendanceDate,
      attendanceType: request.attendanceType,
      remarks: request.remarks ?? null,
      markedAt: new Date().toISOString(),
      markedBy: this.authService.getUserId() ?? 'system',
      status: 'ACTIVE',
      tenantId: resolvedTenantId,
      version: 1,
    };

    this.records.push(record);
    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      attendanceId: record.id,
      action: 'CREATE',
      changedBy: record.markedBy,
      changedAt: record.markedAt,
      previousValue: null,
      newValue: record.attendanceType,
    });

    return of({ success: true, data: record, message: 'Attendance created successfully', error: null, code: null }).pipe(delay(150));
  }

  updateAttendance(id: string, request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const index = this.records.findIndex((r) => r.id === id && r.tenantId === resolvedTenantId);

    if (index === -1) {
      return of({ success: false, data: null, message: 'Attendance record not found', error: 'Attendance record not found', code: 404 }).pipe(delay(120));
    }

    const previous = this.records[index];
    const updated: AttendanceRecord = {
      ...previous,
      ...request,
      studentName: STUDENT_DIRECTORY[request.studentId]?.name ?? previous.studentName,
      className: STUDENT_DIRECTORY[request.studentId]?.className ?? previous.className,
      tenantId: resolvedTenantId,
      version: previous.version + 1,
    };
    this.records[index] = updated;

    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      attendanceId: updated.id,
      action: 'UPDATE',
      changedBy: this.authService.getUserId() ?? 'system',
      changedAt: new Date().toISOString(),
      previousValue: previous.attendanceType,
      newValue: updated.attendanceType,
    });

    return of({ success: true, data: updated, message: 'Attendance updated successfully', error: null, code: null }).pipe(delay(150));
  }

  deleteAttendance(id: string, tenantId: string): Observable<ApiResponse<null>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const index = this.records.findIndex((r) => r.id === id && r.tenantId === resolvedTenantId);

    if (index === -1) {
      return of({ success: false, data: null, message: 'Attendance record not found', error: 'Attendance record not found', code: 404 }).pipe(delay(120));
    }

    const [removed] = this.records.splice(index, 1);
    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      attendanceId: removed.id,
      action: 'DELETE',
      changedBy: this.authService.getUserId() ?? 'system',
      changedAt: new Date().toISOString(),
      previousValue: removed.attendanceType,
      newValue: null,
    });

    return of({ success: true, data: null, message: 'Attendance deleted successfully', error: null, code: null }).pipe(delay(120));
  }

  getDashboard(tenantId: string): Observable<ApiResponse<AttendanceDashboard>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const todayRecords = this.records.filter((r) => r.tenantId === resolvedTenantId && r.attendanceDate === this.today());
    const allStudentIds = this.studentIdsForTenant(resolvedTenantId);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const below75 = allStudentIds
      .map((studentId) => this.buildSummary(studentId, currentMonth, currentYear, resolvedTenantId))
      .filter((summary) => summary.attendancePercentage < 75)
      .map((summary) => ({ studentId: summary.studentId, attendancePercentage: summary.attendancePercentage }));

    const presentCount = todayRecords.filter((r) => r.attendanceType === 'PRESENT').length;
    const absentCount = todayRecords.filter((r) => r.attendanceType === 'ABSENT').length;
    const lateCount = todayRecords.filter((r) => r.attendanceType === 'LATE').length;
    const leaveCount = todayRecords.filter((r) => r.attendanceType === 'LEAVE').length;
    const holidayCount = todayRecords.filter((r) => r.attendanceType === 'HOLIDAY').length;
    const totalStudents = allStudentIds.length;
    const attendancePercentageToday = todayRecords.length > 0 ? Math.round(((presentCount + lateCount) / todayRecords.length) * 100) : 0;

    const dashboard: AttendanceDashboard = {
      todayDate: this.today(),
      presentCount,
      absentCount,
      lateCount,
      leaveCount,
      holidayCount,
      totalStudents,
      attendancePercentageToday,
      studentsBelow75Percent: below75,
    };

    return of({ success: true, data: dashboard, message: 'Dashboard retrieved successfully', error: null, code: null }).pipe(delay(150));
  }

  recalculateSummary(studentId: string, month: number, year: number, tenantId: string): Observable<ApiResponse<AttendanceSummary>> {
    const summary = this.buildSummary(studentId, month, year, tenantId || this.getTenantId());
    return of({ success: true, data: summary, message: 'Summary recalculated successfully', error: null, code: null }).pipe(delay(150));
  }

  getAuditTrail(tenantId: string, filters: AuditFilters, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceAudit>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const recordIds = new Set(this.records.filter((r) => r.tenantId === resolvedTenantId).map((r) => r.id));

    const filtered = this.auditLogs.filter((log) => {
      if (!recordIds.has(log.attendanceId)) return false;
      if (filters.attendanceId && log.attendanceId !== filters.attendanceId) return false;
      if (filters.fromDate && log.changedAt < filters.fromDate) return false;
      if (filters.toDate && log.changedAt > filters.toDate) return false;
      return true;
    });

    return of(this.paginate(filtered, page, limit)).pipe(delay(120));
  }

  // ---------- Reports ----------

  getDailyReport(tenantId: string, date: string, classId?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceRecord>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const filtered = this.records.filter((r) => r.tenantId === resolvedTenantId && r.attendanceDate === date && (!classId || r.classId === classId));
    return of(this.paginate(filtered, page, limit)).pipe(delay(150));
  }

  getMonthlyReport(tenantId: string, month: number, year: number, classId?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceSummary>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const summaries = this.studentIdsForTenant(resolvedTenantId, classId).map((studentId) => this.buildSummary(studentId, month, year, resolvedTenantId));
    return of(this.paginate(summaries, page, limit)).pipe(delay(150));
  }

  getYearlyReport(tenantId: string, year: number, classId?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceSummary>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const studentIds = this.studentIdsForTenant(resolvedTenantId, classId);
    const summaries = studentIds.map((studentId) => {
      const monthlySummaries = Array.from({ length: 12 }, (_, i) => this.buildSummary(studentId, i + 1, year, resolvedTenantId));
      const workingDays = monthlySummaries.reduce((sum, s) => sum + s.workingDays, 0);
      const presentDays = monthlySummaries.reduce((sum, s) => sum + s.presentDays, 0);
      const absentDays = monthlySummaries.reduce((sum, s) => sum + s.absentDays, 0);
      const lateDays = monthlySummaries.reduce((sum, s) => sum + s.lateDays, 0);
      const leaveDays = monthlySummaries.reduce((sum, s) => sum + s.leaveDays, 0);
      const halfDays = monthlySummaries.reduce((sum, s) => sum + s.halfDays, 0);
      const medicalLeaveDays = monthlySummaries.reduce((sum, s) => sum + s.medicalLeaveDays, 0);
      const attendedDays = presentDays + lateDays + halfDays * 0.5;
      const summary: AttendanceSummary = {
        studentId,
        studentName: STUDENT_DIRECTORY[studentId]?.name,
        monthVal: 0,
        yearVal: year,
        workingDays,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        halfDays,
        medicalLeaveDays,
        attendancePercentage: workingDays > 0 ? Math.round((attendedDays / workingDays) * 100) : 0,
      };
      return summary;
    });
    return of(this.paginate(summaries, page, limit)).pipe(delay(150));
  }

  getClassReport(classId: string, tenantId: string, fromDate?: string, toDate?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceRecord>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const filtered = this.records.filter((r) => {
      if (r.tenantId !== resolvedTenantId || r.classId !== classId) return false;
      if (fromDate && r.attendanceDate < fromDate) return false;
      if (toDate && r.attendanceDate > toDate) return false;
      return true;
    });
    return of(this.paginate(filtered, page, limit)).pipe(delay(150));
  }

  getStudentReport(studentId: string, tenantId: string, fromDate?: string, toDate?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceRecord>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const filtered = this.records.filter((r) => {
      if (r.tenantId !== resolvedTenantId || r.studentId !== studentId) return false;
      if (fromDate && r.attendanceDate < fromDate) return false;
      if (toDate && r.attendanceDate > toDate) return false;
      return true;
    });
    return of(this.paginate(filtered, page, limit)).pipe(delay(150));
  }

  getLowAttendanceReport(tenantId: string, month: number, year: number, threshold = 75, classId?: string, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceSummary>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const summaries = this.studentIdsForTenant(resolvedTenantId, classId)
      .map((studentId) => this.buildSummary(studentId, month, year, resolvedTenantId))
      .filter((summary) => summary.attendancePercentage < threshold);
    return of(this.paginate(summaries, page, limit)).pipe(delay(150));
  }

  getPercentageReport(tenantId: string, month: number, year: number, classId?: string, page = 1, limit = 40): Observable<PaginatedResponse<AttendanceSummary>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const summaries = this.studentIdsForTenant(resolvedTenantId, classId)
      .map((studentId) => this.buildSummary(studentId, month, year, resolvedTenantId))
      .sort((a, b) => a.attendancePercentage - b.attendancePercentage);
    return of(this.paginate(summaries, page, limit)).pipe(delay(150));
  }

  // ---------- Teacher ----------

  markAttendance(request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    return this.createAttendance({ ...request, teacherId: request.teacherId ?? this.authService.getUserId() ?? undefined }, tenantId);
  }

  updateTeacherAttendance(id: string, request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const existing = this.records.find((r) => r.id === id && r.tenantId === resolvedTenantId);

    if (!existing) {
      return of({ success: false, data: null, message: 'Attendance record not found', error: 'Attendance record not found', code: 404 }).pipe(delay(120));
    }
    if (existing.attendanceDate !== this.today()) {
      return of({ success: false, data: null, message: 'Only today\'s attendance can be edited', error: 'Access denied', code: 403 }).pipe(delay(120));
    }

    return this.updateAttendance(id, request, resolvedTenantId);
  }

  getClassAttendance(classId: string, date: string, tenantId: string): Observable<ApiResponse<AttendanceRecord[]>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const records = this.records.filter((r) => r.tenantId === resolvedTenantId && r.classId === classId && r.attendanceDate === date);
    return of({ success: true, data: records, message: 'Class attendance retrieved successfully', error: null, code: null }).pipe(delay(120));
  }

  getStudentHistory(studentId: string, tenantId: string, fromDate?: string, toDate?: string, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceRecord>> {
    return this.getStudentReport(studentId, tenantId, fromDate, toDate, page, limit);
  }

  getTodayAttendance(tenantId: string): Observable<ApiResponse<AttendanceRecord[]>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const teacherId = this.authService.getUserId() ?? undefined;
    const records = this.records.filter(
      (r) => r.tenantId === resolvedTenantId && r.attendanceDate === this.today() && (!teacherId || r.teacherId === teacherId),
    );
    return of({ success: true, data: records, message: "Today's attendance retrieved successfully", error: null, code: null }).pipe(delay(120));
  }

  // ---------- Parent ----------

  getChildAttendance(studentId: string, tenantId: string, fromDate?: string, toDate?: string, page = 1, limit = 20): Observable<PaginatedResponse<AttendanceRecord>> {
    return this.getStudentReport(studentId, tenantId, fromDate, toDate, page, limit);
  }

  getChildMonthlySummary(studentId: string, month: number, year: number, tenantId: string): Observable<ApiResponse<AttendanceSummary>> {
    const summary = this.buildSummary(studentId, month, year, tenantId || this.getTenantId());
    return of({ success: true, data: summary, message: 'Monthly summary retrieved successfully', error: null, code: null }).pipe(delay(120));
  }

  getChildYearlySummary(studentId: string, year: number, tenantId: string): Observable<ApiResponse<YearlySummary>> {
    const resolvedTenantId = tenantId || this.getTenantId();
    const monthlySummaries = Array.from({ length: 12 }, (_, i) => this.buildSummary(studentId, i + 1, year, resolvedTenantId));
    const totalWorkingDays = monthlySummaries.reduce((sum, s) => sum + s.workingDays, 0);
    const totalPresent = monthlySummaries.reduce((sum, s) => sum + s.presentDays, 0);
    const totalAbsent = monthlySummaries.reduce((sum, s) => sum + s.absentDays, 0);
    const totalLate = monthlySummaries.reduce((sum, s) => sum + s.lateDays, 0);
    const overallPercentage = totalWorkingDays > 0 ? Math.round(((totalPresent + totalLate) / totalWorkingDays) * 100) : 0;

    const summary: YearlySummary = { studentId, year, totalPresent, totalAbsent, totalLate, totalWorkingDays, overallPercentage };
    return of({ success: true, data: summary, message: 'Yearly summary retrieved successfully', error: null, code: null }).pipe(delay(120));
  }

  getChildCurrentSummary(studentId: string, tenantId: string): Observable<ApiResponse<AttendanceSummary>> {
    const now = new Date();
    return this.getChildMonthlySummary(studentId, now.getMonth() + 1, now.getFullYear(), tenantId);
  }
}
