import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AttendanceListComponent } from './features/attendance/components/attendance-list.component';
import { AttendanceFormComponent } from './features/attendance/components/attendance-form.component';
import { AttendanceDashboardComponent } from './features/attendance/components/attendance-dashboard.component';
import { AttendanceAuditComponent } from './features/attendance/components/attendance-audit.component';
import { AttendanceReportsHubComponent } from './features/attendance/components/attendance-reports-hub.component';
import { AttendanceReportComponent } from './features/attendance/components/attendance-report.component';
import { TeacherMarkAttendanceComponent } from './features/attendance/components/teacher-mark-attendance.component';
import { TeacherTodayAttendanceComponent } from './features/attendance/components/teacher-today-attendance.component';
import { TeacherStudentHistoryComponent } from './features/attendance/components/teacher-student-history.component';
import { ParentAttendanceComponent } from './features/attendance/components/parent-attendance.component';
import { LoginComponent } from './features/auth/login.component';
import { DailyDiaryComponent } from './features/homework/daily-diary.component';
import { TeacherHomeworkComponent } from './features/homework/teacher-homework.component';
import { BusLocationComponent } from './features/bus/bus-location.component';
import { FeeDashboardComponent } from './features/fees/components/fee-dashboard.component';
import { FeeReportsComponent } from './features/fees/components/fee-reports.component';
import { FeeManagementComponent } from './features/fees/components/fee-management.component';
import { FeeParentViewComponent } from './features/fees/components/fee-parent-view.component';
import { FeeTeacherViewComponent } from './features/fees/components/fee-teacher-view.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { LeaveRequestsComponent } from './features/leave-requests/leave-requests.component';
import { ParentDashboardComponent } from './features/parent/parent-dashboard.component';
import { StudentDetailComponent as ParentStudentDetailComponent } from './features/students/student-detail.component';
import { StudentListComponent as ParentStudentListComponent } from './features/students/student-list.component';
import { StudentListComponent as AdminStudentListComponent } from './features/student/student-list.component';
import { StudentDetailComponent as AdminStudentDetailComponent } from './features/student/student-detail.component';
import { StudentFormComponent } from './features/student/student-form.component';
import { SchoolListComponent } from './features/admin/school-list.component';
import { TenantListComponent } from './features/admin/tenant-list.component';
import { UserListComponent } from './features/admin/user-list.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: 'home', component: ParentDashboardComponent },
      { path: 'students', component: ParentStudentListComponent },
      { path: 'students/:id', component: ParentStudentDetailComponent },
      { path: 'attendance', component: ParentAttendanceComponent },
      { path: 'daily-diary', component: DailyDiaryComponent },
      { path: 'fees', component: FeeDashboardComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'leave-requests', component: LeaveRequestsComponent },
      { path: 'bus', component: BusLocationComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'] },
    children: [
      { path: 'tenants', component: TenantListComponent },
      { path: 'schools', component: SchoolListComponent },
      { path: 'users', component: UserListComponent },
      { path: 'students', component: AdminStudentListComponent },
      { path: 'students/create', component: StudentFormComponent },
      { path: 'students/:id', component: AdminStudentDetailComponent },
      { path: 'students/:id/edit', component: StudentFormComponent },
      { path: 'attendance', component: AttendanceListComponent },
      { path: 'attendance/create', component: AttendanceFormComponent },
      { path: 'attendance/dashboard', component: AttendanceDashboardComponent },
      { path: 'attendance/audit', component: AttendanceAuditComponent },
      { path: 'attendance/reports', component: AttendanceReportsHubComponent },
      { path: 'attendance/reports/:type', component: AttendanceReportComponent },
      { path: 'attendance/:id/edit', component: AttendanceFormComponent },
      { path: 'fees', component: FeeDashboardComponent },
      { path: 'fees/reports', component: FeeReportsComponent },
      { path: 'fees/manage', component: FeeManagementComponent },
      { path: '', redirectTo: 'tenants', pathMatch: 'full' },
    ],
  },
  {
    path: 'teacher',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_TEACHER'] },
    children: [
      { path: 'attendance/mark', component: TeacherMarkAttendanceComponent },
      { path: 'attendance/today', component: TeacherTodayAttendanceComponent },
      { path: 'attendance/student', component: TeacherStudentHistoryComponent },
      { path: 'homework', component: TeacherHomeworkComponent },
      { path: 'fees', component: FeeDashboardComponent },
      { path: '', redirectTo: 'attendance/mark', pathMatch: 'full' },
    ],
  },
  // Flat aliases matching the fees/attendance module spec; each is role-guarded and reuses the
  // same components already routed above under /admin, /teacher, /app.
  {
    path: 'fees',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'] },
    children: [
      { path: '', component: FeeDashboardComponent },
      { path: 'management', component: FeeManagementComponent },
      { path: 'reports', component: FeeReportsComponent },
    ],
  },
  {
    path: 'fees/my-fees',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_PARENT'] },
    component: FeeParentViewComponent,
  },
  {
    path: 'fees/class-status',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_TEACHER'] },
    component: FeeTeacherViewComponent,
  },
  {
    path: 'attendance',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'] },
    children: [
      { path: '', component: AttendanceDashboardComponent },
      { path: 'admin', component: AttendanceListComponent },
      { path: 'reports', component: AttendanceReportsHubComponent },
    ],
  },
  {
    path: 'attendance/mark',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_TEACHER'] },
    component: TeacherMarkAttendanceComponent,
  },
  {
    path: 'attendance/my-attendance',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_PARENT'] },
    component: ParentAttendanceComponent,
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];

