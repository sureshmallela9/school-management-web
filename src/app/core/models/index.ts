export interface JwtPayload {
  sub: string;
  roles: string[];
  tenantId?: string;
  userId?: string;
  iat?: number;
  exp?: number;
}

export interface AttendanceSummary {
  studentId: string;
  monthVal: number;
  yearVal: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  halfDays?: number;
  medicalLeaveDays?: number;
  workingDays?: number;
  attendancePercentage?: number;
}

export interface RecentAttendance {
  id?: string;
  attendanceDate: string;
  attendanceType: string;
  remarks?: string;
}

export interface DailyDiaryDto {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  subjectName?: string;
  assignedDate?: string;
  dueDate?: string;
  teacherName?: string;
  status?: string;
  attachments?: string[];
}

export interface StudentWithDetailsDto {
  id: string;
  name: string;
  rollNumber?: string;
  admissionNumber?: string;
  section?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  avatarUrl?: string | null;
  bloodGroup?: string;
  address?: string;
  classId?: string;
  className?: string;
  monthlySummary?: AttendanceSummary;
  recentAttendance?: RecentAttendance[];
  todayStatus?: string;
  dailyDiary?: DailyDiaryDto[];
}

export interface ParentDashboardDto {
  childrenCount: number;
  children: StudentWithDetailsDto[];
  outstandingFeeBalance?: number;
  unreadNotificationCount?: number;
  pendingLeaveRequestCount?: number;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roles: string[];
  schoolId?: string;
}

export interface TenantDto {
  id?: string;
  name: string;
  code: string;
  address?: string;
  active?: boolean;
}

export interface Homework {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subjectName?: string;
  classId: string;
  assignedDate: string;
  dueDate: string;
  teacherName?: string;
  attachments?: string[];
}
