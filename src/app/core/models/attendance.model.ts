import { ApiResponse, PaginatedResponse } from './student.model';

export type AttendanceType = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'MEDICAL_LEAVE';

export const ATTENDANCE_TYPES: AttendanceType[] = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'HOLIDAY', 'MEDICAL_LEAVE'];

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  teacherId: string | null;
  classId: string;
  className?: string;
  sectionId: string | null;
  academicYearId: string | null;
  attendanceDate: string;
  attendanceType: AttendanceType;
  remarks: string | null;
  markedAt: string;
  markedBy: string;
  status: string;
  tenantId: string;
  version: number;
}

export interface AttendanceRequest {
  studentId: string;
  classId: string;
  attendanceDate: string;
  attendanceType: AttendanceType;
  teacherId?: string;
  sectionId?: string;
  academicYearId?: string;
  remarks?: string;
}

export interface AttendanceSummary {
  studentId: string;
  studentName?: string;
  monthVal: number;
  yearVal: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  halfDays: number;
  medicalLeaveDays: number;
  workingDays: number;
  attendancePercentage: number;
}

export interface YearlySummary {
  studentId: string;
  year: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalWorkingDays: number;
  overallPercentage: number;
}

export interface AttendanceDashboard {
  todayDate: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  holidayCount: number;
  totalStudents: number;
  attendancePercentageToday: number;
  studentsBelow75Percent: { studentId: string; attendancePercentage: number }[];
}

export interface AttendanceAudit {
  id: string;
  attendanceId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changedBy: string;
  changedAt: string;
  previousValue: string | null;
  newValue: string | null;
}

export interface AttendanceFilters {
  classId?: string;
  studentId?: string;
  attendanceDate?: string;
  attendanceType?: AttendanceType;
}

export interface AuditFilters {
  attendanceId?: string;
  fromDate?: string;
  toDate?: string;
}

export type { ApiResponse, PaginatedResponse };
