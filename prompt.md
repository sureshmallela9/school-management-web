Build a full-featured Angular application (Angular >= 15) named SchoolManagementUI with the following requirements:
Tech stack: Angular, Angular Material, RxJS, NgRx (state management recommended), TypeScript, SCSS. Provide a PWA config (ng add @angular/pwa). Use Angular CLI layout and lazy-loaded feature modules.
Auth: JWT login with refresh support. HTTP interceptor to attach Authorization header. AuthService must parse JWT to expose getTenantId(), getUserId(), getRoles(). Use route guards (AuthGuard and RoleGuard).
Multi-tenant: UI must read tenantId from JWT (no manual tenant query param for parent flows). Admin tenant screens may allow selecting/switching tenant.
Modules: Auth, Parent, Attendance, Fees, Homework (Daily Diary), Students, Teachers, Notifications, Admin (tenants + school + users), Reports, Bus.
Provide mock/server mode for development (proxy to backend + mock JSON option).
Provide unit tests (Jest or Karma + Jasmine) and e2e tests (Cypress).
Accessibility: WCAG basics, semantic HTML, keyboard navigation.
Detailed Application requirements
App shell & cross-cutting
AppModule + CoreModule + SharedModule pattern
CoreModule contains AuthService, ApiInterceptor, ErrorHandlerService, ApiError model
SharedModule contains MaterialModule (imports/exports commonly used Mat modules), common components
Lazy-load feature modules below via AppRouting
Routing (high-level)
/auth/login (LoginComponent)
/app (protected shell)
/app/home (ParentDashboardComponent)
/app/students (StudentListComponent)
/app/students/:id (StudentDetailComponent)
/app/attendance (AttendanceListComponent) — history, filters by child
/app/daily-diary (DailyDiaryComponent)
/app/fees (FeeDashboardComponent / FeeDetails)
/app/notifications (NotificationsComponent)
/app/leave-requests (LeaveRequestsComponent)
/app/bus (BusLocationComponent)
/admin (protected, admin only)
/admin/tenants (TenantListComponent, TenantFormComponent)
/admin/schools (School management)
/admin/users (User management)
Use a bottom navigation for mobile (Home, Subjects, Bus, Attendance, Notices)
Roles and Guards
Roles: ROLE_PARENT, ROLE_TEACHER, ROLE_ADMIN, ROLE_SUPERADMIN
AuthGuard: checks token present and not expired
RoleGuard: checks roles array (from JWT) and allows/disallows admin routes
Tenant awareness: services pass tenantId from AuthService by default
State management
Use NgRx for central state: auth (token, user), dashboard (ParentDashboardDto), students, attendance, homework, notifications.
Use feature stores for heavy modules (attendance, fees)
Use effects to handle API side-effects and caching
Styling & Components
Use Angular Material with a custom theme; use MatToolbar, MatCard, MatIcon, MatList, MatBottomSheet, MatDialog, MatTabs, MatProgressSpinner, MatBadge.
Mobile-first responsive layout. Student cards vertically stacked with quick actions.
Components:
Shell: HeaderComponent (profile, school name), BottomNavComponent, Sidenav (optional for wider screens)
ParentDashboardModule
ParentDashboardComponent
StudentCardComponent (reusable)
QuickActionCardComponent
StudentModule
StudentListComponent
StudentDetailComponent (profile, attendance graph, fees)
AttendanceModule
AttendanceListComponent (filters: student, date range)
AttendanceDetailComponent
HomeworkModule
DailyDiaryComponent (list grouped by date)
HomeworkCardComponent
FeesModule
FeeDashboardComponent
FeeDetailsComponent (ledger, receipts)
NotificationModule
NotificationsComponent
AdminModule
TenantListComponent
TenantFormComponent
SchoolListComponent / SchoolFormComponent
Shared small components: StatusBadge, ProgressDonut, LoaderSkeleton
API mapping and DTOs
Implement Angular TypeScript interfaces matching backend DTOs. Use these in services and components.
TypeScript interfaces (copy into src/app/core/models)
Auth token payload


export interface JwtPayload {
  sub: string;           // email
  roles: string[];       // roles
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
  attendanceDate: string; // ISO date
  attendanceType: string; // PRESENT|ABSENT|LATE|LEAVE
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
  attendanceDate: string; // ISO date
  attendanceType: string; // PRESENT|ABSENT|LATE|LEAVE
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

export interface UserDto { id:string; name:string; email:string; tenantId:string; roles:string[]; }

export interface TenantDto { id?: string; name: string; code: string; address?: string; active?: boolean; }

export interface Homework { id:string; title:string; description?:string; subjectId:string; subjectName?:string; classId:string; assignedDate:string; dueDate:string; teacherName?:string; attachments?:string[]; }

API endpoints mapping (recommended usage)
Auth
POST /api/auth/login {email,password} => { token }
POST /api/auth/refresh => { token } (if implemented)
Parent
GET /api/parent/dashboard => ApiResponse<parentdashboarddto></parentdashboarddto>
GET /api/parent/profile => ApiResponse<userdto></userdto>
GET /api/parent/my-students?page&limit&tenantId => PaginatedResponse<studentdto> (but prefer tenant from token)</studentdto>
GET /api/parent/my-children/attendance?studentId&fromDate&toDate&page&limit => PaginatedResponse<attendanceresponse></attendanceresponse>
GET /api/parent/notifications?isRead&page&limit => PaginatedResponse<notification></notification>
POST /api/parent/leave-requests => create leave request
Homework (Daily Diary)
GET /api/homework?classId={classId}&tenantId={tenantId} or GET /api/homework/class/{classId}?tenantId=
GET /api/homework/{id}?tenantId=
Tenants
GET /api/admin/tenants
POST /api/admin/tenants
GET /api/admin/tenants/{id}
PUT /api/admin/tenants/{id}
DELETE /api/admin/tenants/{id} (deactivate)
Attendance service
GET /api/attendance?classId=...&studentId=...&date=...
Use backend AttendanceService endpoints documented earlier
UI behavior & UX specifics
Parent Dashboard
On /app/home fetch /api/parent/dashboard; show loader till data is ready
For each child: show name, class, roll, todayStatus badge (green=present, red=absent, yellow=late, grey=not marked)
Monthly summary: small radial progress (attendancePercentage) + numbers for present/absent/leave
Recent attendance: last N items (date + status + tooltip for remarks)
Daily diary: show up to N items with small icons; tap opens homework detail
Error handling: show toast/snackbar for API errors with friendly messages
Offline: cache last dashboard in local storage and show with an offline banner (PWA)
Development & run commands (in README style)