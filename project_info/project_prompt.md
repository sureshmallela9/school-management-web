# Angular 17+ UI Generation Prompt — School Management System

**You are to build an Angular 17+ UI for the following Spring Boot backend. Follow every section exactly.** Do NOT invent endpoints, fields, or roles. If something is not described here, ask before implementing. All endpoints, DTOs, roles, and validation rules below were derived directly from the backend source of truth.

---

## 1. Project Overview

Build a multi-tenant, multi-role **School Management System** frontend. The backend supports three primary end-user roles — **ADMIN**, **TEACHER**, **PARENT** (a `STUDENT` role name exists in `Role.java` but no student-facing controllers are exposed) — plus internal helpers. Every authenticated request carries a JWT bearer token; almost every endpoint also requires a `tenantId` query parameter (the tenant is obtained from the login response's `user.tenantId` and echoed back on subsequent calls).

**Modules to implement:**
- Auth (login, forgot password, OTP verify)
- Admin dashboard, User Management (Parent creation), Students, Teachers (+ their subjects/classes), Schools, Notifications
- Teacher: legacy attendance marking, homework
- Parent: my-students, student fees, bus location
- **Attendance Module (v1)**: admin CRUD + reports + dashboard + audit + summary recalculation; teacher mark/update/view; parent read-only child views + monthly/yearly/summary
- **Fee Module**: academic years, categories, terms, structures, class/student assignments, receipts (immutable), ledger, dashboard, reports (student/class/outstanding/paid/overdue), parent summary & receipts, teacher class summary

---

## 2. Tech Stack & Conventions

- **Angular 17+** with **standalone components**, `provideRouter`, lazy-loaded feature routes (`loadChildren` / `loadComponent`).
- **Angular Material 17** (chosen over PrimeNG: tighter Angular team support, great built-in a11y, snackbar/dialog/table primitives, native theming) + `@angular/cdk`.
- **Reactive Forms** everywhere; no template-driven forms.
- **RxJS 7** with `HttpClient`, functional interceptors (`withInterceptors`).
- **State**: lightweight per-feature stores using `BehaviorSubject` (or Angular Signals inside services). No NgRx — the app is CRUD-heavy but not event-sourced.
- **SCSS**, BEM-ish naming, Material theming with a `styles/_theme.scss`.
- **Strict TypeScript** (`"strict": true`, `noImplicitAny`, `strictNullChecks`). **No `any` anywhere**.
- **ESLint** (`@angular-eslint/recommended`) + **Prettier**.
- **Chart.js + ng2-charts** for dashboard charts.
- **date-fns** for date manipulation. All API dates are ISO strings (LocalDate → `'YYYY-MM-DD'`, LocalDateTime → `'YYYY-MM-DDTHH:mm:ss'`).
- **ngx-toastr** OR Material `MatSnackBar` for toasts — use `MatSnackBar` for consistency.
- Currency: **INR** (₹) — build a `currencyInr` pipe.

---

## 3. Folder Structure

```
src/app/
├─ core/
│  ├─ auth/            (auth.service.ts, auth.store.ts, token.service.ts)
│  ├─ guards/          (auth.guard.ts, role.guard.ts, guest.guard.ts)
│  ├─ interceptors/    (auth.interceptor.ts, error.interceptor.ts, envelope.interceptor.ts)
│  ├─ http/            (api-config.ts, http-params.util.ts)
│  ├─ models/          (api-response.model.ts, paginated-response.model.ts, enums.ts, index.ts + per-module *.model.ts)
│  └─ services/        (per-controller services — see §8)
├─ shared/
│  ├─ components/      (data-table, page-header, empty-state, loading-spinner, confirm-dialog, role-badge, status-chip, file-upload, date-range-picker, print-receipt)
│  ├─ directives/      (has-role.directive.ts)
│  ├─ pipes/           (currency-inr.pipe.ts, date-fmt.pipe.ts, enum-label.pipe.ts)
│  └─ ui/              (buttons, cards wrappers)
├─ layouts/
│  ├─ auth-layout/
│  └─ main-layout/     (top bar, role-aware side nav, user menu)
├─ features/
│  ├─ auth/            (login, forgot-password, verify-otp)
│  ├─ admin/
│  │  ├─ dashboard/
│  │  ├─ users/        (parents list + create)
│  │  ├─ students/     (list, detail, create)
│  │  ├─ teachers/     (list, detail with subjects & classes tabs)
│  │  ├─ schools/      (list/search)
│  │  ├─ notifications/(list, mark-as-read)
│  │  └─ attendance/   (list, create, edit, dashboard, audit, reports)
│  ├─ teacher/
│  │  ├─ attendance-legacy/  (class-day marking)
│  │  ├─ homework/           (list, create)
│  │  ├─ attendance/         (mark, class view, student history, today)
│  │  └─ fees/               (class fee summary)
│  ├─ parent/
│  │  ├─ my-students/
│  │  ├─ student-fees/       (legacy fees list)
│  │  ├─ bus-location/
│  │  ├─ attendance/         (child attendance list + monthly/yearly/summary)
│  │  └─ fees/               (summary + receipts)
│  └─ fees-admin/            (academic years, categories, terms, structures, assignments, receipts, ledger, dashboard, reports)
└─ app.config.ts, app.routes.ts, main.ts
```

---

## 4. Environment & Config

`src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:2020', // Spring Boot server.port=2020, no context-path
  tokenStorageKey: 'sms.jwt',
  refreshTokenStorageKey: 'sms.refreshJwt',
  userStorageKey: 'sms.user',
};
```

Add `proxy.conf.json`:
```json
{ "/api": { "target": "http://localhost:2020", "secure": false, "changeOrigin": true },
  "/schools": { "target": "http://localhost:2020", "secure": false, "changeOrigin": true } }
```
Run dev with `ng serve --proxy-config proxy.conf.json`.

CORS on backend already whitelists `http://localhost:4200` and `http://127.0.0.1:4200`.

---

## 5. Auth & Security

### Login Endpoint
- `POST /api/auth/login` — public, body: `LoginRequest { username: string; password: string }` (`username` accepts email OR name). Returns `ApiResponse<AuthResponse>`.
- `POST /api/auth/forgot-password?email=&tenantId=` — public, returns `ApiResponse<string>`.
- `POST /api/auth/verify-otp?email=&otp=&tenantId=` — public, returns `ApiResponse<AuthResponse>`.

### AuthResponse
```ts
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
```

### JWT Claims (from `JwtUtil`)
- `sub` = username (email)
- `tenantId` = string
- `roles` = string[] (values: `ADMIN`, `TEACHER`, `PARENT`, `STUDENT`)
- `exp`, `iat` standard.
- Access token TTL: 1 h; refresh token TTL: 7 d.

### Storage & Flow
- On login: store `accessToken`, `refreshToken`, `user` in `localStorage` under keys defined in `environment.ts`.
- Extract `tenantId` from `user.tenantId` and expose via `AuthService.tenantId()` / `AuthStore.tenantId$`.
- Auto-append `tenantId` as query param where required (see §7 helper).

### Interceptors
- **`authInterceptor`**: attach `Authorization: Bearer <accessToken>` to every request whose URL starts with `environment.apiBaseUrl` and is not the login/forgot/verify path.
- **`envelopeInterceptor`** (optional): for `ApiResponse<T>` unwrap to `T` and for `PaginatedResponse<T>` keep envelope (needed for pagination).
- **`errorInterceptor`**:
  - `401` → clear tokens, navigate to `/auth/login`, snackbar "Session expired".
  - `403` → snackbar "You do not have access to this resource".
  - `4xx/5xx` → snackbar with `error.error.message || error.error.error || 'Unexpected error'`.

### Guards
- `authGuard` (functional): checks token presence + non-expired via `TokenService.isValid()`.
- `roleGuard(...allowed: Role[])`: returns `UrlTree('/forbidden')` if user's roles do not intersect `allowed`.
- `guestGuard`: redirects authenticated users away from `/auth/*`.

### Route Access Matrix (must match backend `SecurityConfig`)
| Path prefix | Allowed authorities |
| --- | --- |
| `/api/auth/login`, `/forgot-password`, `/verify-otp`, `/api/debug/**`, swagger | permitAll |
| `/api/admin/**` | `ADMIN` |
| `/api/teacher/**` | `TEACHER`, `ADMIN` |
| `/api/parent/**` | `PARENT`, `ADMIN` |
| `/api/v1/admin/**` | `ADMIN` |
| `/api/v1/teacher/**` | `TEACHER`, `ADMIN` |
| `/api/v1/parent/**` | `PARENT`, `ADMIN` |
| everything else | authenticated |

### Example Role-Based Route
```ts
export const routes: Routes = [
  { path: 'auth', canActivate: [guestGuard], loadChildren: () => import('./features/auth/auth.routes') },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'admin', canMatch: [roleGuard(['ADMIN'])], loadChildren: () => import('./features/admin/admin.routes') },
      { path: 'teacher', canMatch: [roleGuard(['TEACHER','ADMIN'])], loadChildren: () => import('./features/teacher/teacher.routes') },
      { path: 'parent',  canMatch: [roleGuard(['PARENT','ADMIN'])],  loadChildren: () => import('./features/parent/parent.routes') },
      { path: 'fees-admin', canMatch: [roleGuard(['ADMIN'])], loadChildren: () => import('./features/fees-admin/fees-admin.routes') },
      { path: '', pathMatch: 'full', redirectTo: '/redirect-by-role' },
    ]
  },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', redirectTo: '/auth/login' },
];
```

---

## 6. Global HTTP Envelope

```ts
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string;
  code?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  error?: string;
  code?: number;
  total: number;      // total elements
  page: number;       // 1-based page number
  limit: number;
  totalPages: number;
}
```

**Pagination convention:** backend accepts `?page=1&limit=10` (1-based) and returns the same shape. Client always sends 1-based page.

Provide `map(res => res.data!)` operators or a small helper `unwrap<T>(): OperatorFunction<ApiResponse<T>, T>`.

---

## 7. Enums (TypeScript Unions)

```ts
export type Role = 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';

export type AttendanceType =
  | 'PRESENT' | 'ABSENT' | 'LATE'
  | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'MEDICAL_LEAVE';

export type AttendanceAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type LegacyAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE';

export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export type FeeTermFrequency = 'ANNUAL' | 'SEMESTER' | 'QUARTER' | 'MONTHLY' | 'CUSTOM';

export type LegacyFeeStatus = 'PAID' | 'PENDING';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
```

Add a helper util for tenant param:
```ts
export function withTenant(params: Record<string, unknown>, tenantId: string): HttpParams {
  let p = new HttpParams().set('tenantId', tenantId);
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v)); });
  return p;
}
```

---

## 8. TypeScript Models (mirror backend DTOs exactly)

### 8.1 Auth / User
```ts
export interface LoginRequest { username: string; password: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; user: UserDto; }
export interface SchoolDto { id: string; name: string; code: string; address: string; }
export interface UserDto {
  id: string; name: string; email: string;
  roles: string[]; tenantId: string;
  school: SchoolDto | null;
}
```

### 8.2 Core domain
```ts
export interface ClassEntityDto { id: string; name: string; section: string; }
export interface SubjectDto { id: string; name: string; }

export interface StudentDto {
  id: string; name: string; rollNumber: string;
  classId: string; className: string; section: string;
  parentId: string; parentName: string;
  phone: string | null; avatarUrl: string | null;
  dateOfBirth: string | null;   // 'YYYY-MM-DD'
  gender: string | null;
  admissionNumber: string | null;
  bloodGroup: string | null;
  address: string | null;
  tenantId: string;
}

export interface TeacherDto {
  id: string; name: string; employeeId: string;
  email: string; phone: string | null;
  subjects: SubjectDto[];       // Set on backend
  classes: ClassEntityDto[];
  avatarUrl: string | null;
  qualification: string | null;
  joinDate: string | null;      // 'YYYY-MM-DD'
  isClassTeacher: boolean;
  classTeacherOf: string | null;
  tenantId: string;
}

export interface School {          // /schools returns entity directly
  id: string; name: string; code: string; address: string; /* + fields backend exposes */
}

export interface Notification {
  id: string; title: string; message: string;
  type: string | null; timestamp: number | null; isRead: boolean;
  targetRole: string | null; actionUrl: string | null; tenantId: string;
}

export interface Homework {
  id: string; title: string; description: string | null;
  subjectId: string; subjectName: string | null;
  classId: string; className: string | null;
  dueDate: string; assignedDate: string;
  teacherId: string; teacherName: string | null;
  attachments: string[] | null; status: string | null; tenantId: string;
}

export interface LegacyAttendance {
  id: string; studentId: string; studentName: string | null;
  date: string; status: LegacyAttendanceStatus; classId: string;
  subjectId: string | null; markedBy: string; remarks: string | null; tenantId: string;
}

export interface LegacyFee {
  id: string; studentId: string; studentName: string | null;
  feeType: string; amount: number; dueDate: string;
  paidDate: string | null; status: LegacyFeeStatus;
  receiptNumber: string | null; paymentMethod: string | null; tenantId: string;
}
```

### 8.3 Admin
```ts
export interface AdminDashboardDto {
  totalStudents: number; totalTeachers: number;
  totalFeesCollected: number; totalPendingFees: number;
  totalNotifications: number;
}

export interface CreateParentRequest {
  name: string;          // @NotBlank
  email: string;         // @NotBlank @Email
  password: string;      // @NotBlank
  phone?: string;
  avatarUrl?: string;
  schoolId: string;      // @NotBlank
  tenantId: string;      // @NotBlank
}
```

### 8.4 Parent
```ts
export interface BusLocationDto {
  busId: string; latitude: number; longitude: number;
  lastUpdated: string; estimatedArrivalTime: string; status: string;
}
```

### 8.5 Attendance (v1 — `com.school.management.attendance.dto`)
```ts
export interface AttendanceRequest {
  studentId: string;                 // @NotBlank
  teacherId?: string;
  classId: string;                   // @NotBlank
  sectionId?: string;
  academicYearId?: string;
  attendanceDate: string;            // @NotNull, LocalDate, cannot be future
  attendanceType: AttendanceType;    // @NotNull
  remarks?: string;
}

export interface AttendanceResponse {
  id: string; studentId: string; teacherId: string | null;
  classId: string; sectionId: string | null; academicYearId: string | null;
  attendanceDate: string; attendanceType: AttendanceType;
  remarks: string | null; markedAt: string; markedBy: string;
  status: string | null; tenantId: string; version: number;
}

export interface AttendanceSummaryResponse {
  studentId: string; monthVal: number; yearVal: number;
  presentDays: number; absentDays: number; lateDays: number;
  leaveDays: number; halfDays: number; medicalLeaveDays: number;
  workingDays: number; attendancePercentage: number;
}

export interface YearlySummaryResponse {
  studentId: string; year: number;
  totalPresent: number; totalAbsent: number; totalLate: number;
  totalWorkingDays: number; overallPercentage: number;
}

export interface LowAttendanceStudentDto { studentId: string; attendancePercentage: number; }

export interface AttendanceDashboardResponse {
  todayDate: string;
  presentCount: number; absentCount: number; lateCount: number;
  leaveCount: number; holidayCount: number; totalStudents: number;
  attendancePercentageToday: number;
  studentsBelow75Percent: LowAttendanceStudentDto[];
}

export interface AttendanceAuditResponse {
  id: string; attendanceId: string;
  action: AttendanceAction; changedBy: string; changedAt: string;
  previousValue: string | null; newValue: string | null;
}

// Legacy teacher endpoint payload
export interface LegacyAttendanceUpdateRequest {
  classId: string; date: string; tenantId: string; markedBy: string;
  attendanceRecords: {
    studentId: string; studentName?: string;
    status: LegacyAttendanceStatus; subjectId?: string; remarks?: string;
  }[];
}
```

### 8.6 Fees
```ts
export interface AcademicYearRequestDto {
  name: string; startDate: string; endDate: string; active?: boolean;
}
export interface AcademicYearResponseDto {
  id: string; name: string; startDate: string; endDate: string;
  active: boolean; tenantId: string; createdAt: string; updatedAt: string;
}

export interface FeeCategoryRequestDto { name: string; description?: string; }
export interface FeeCategoryResponseDto {
  id: string; name: string; description: string | null;
  deleted: boolean; tenantId: string; createdAt: string; updatedAt: string;
}

export interface FeeTermRequestDto {
  academicYearId: string; label: string;
  frequency: FeeTermFrequency;
  startDate?: string; endDate?: string;
}
export interface FeeTermResponseDto {
  id: string; academicYearId: string; label: string; frequency: FeeTermFrequency;
  startDate: string | null; endDate: string | null;
  tenantId: string; createdAt: string; updatedAt: string;
}

export interface FeeStructureRequestDto {
  academicYearId: string; classId: string; feeCategoryId: string; feeTermId: string;
  amount: number;        // @Positive
  dueDate: string;
}
export interface FeeStructureResponseDto {
  id: string; academicYearId: string; classId: string; feeCategoryId: string;
  feeTermId: string; amount: number; dueDate: string;
  tenantId: string; createdAt: string; updatedAt: string;
}

export interface ClassFeeAssignmentRequestDto {
  feeStructureId: string; classId: string; overrideAmount?: number;
}
export interface StudentFeeAssignmentRequestDto {
  feeStructureId: string; studentId: string; overrideAmount?: number;
}
export interface FeeAssignmentResponseDto {
  id: string; feeStructureId: string;
  assignmentType: 'CLASS' | 'STUDENT';
  classId: string | null; studentId: string | null;
  overrideAmount: number | null;
  tenantId: string; createdAt: string; updatedAt: string;
}

export interface FeeReceiptRequestDto {
  ledgerEntryId: string; amountPaid: number;    // @Positive
  receiptDate: string; remarks?: string;
}
export interface FeeReceiptResponseDto {
  id: string; receiptNumber: string; ledgerEntryId: string;
  studentId: string; amountPaid: number; receiptDate: string;
  remarks: string | null; tenantId: string; createdAt: string;
}

export interface StudentFeeLedgerDto {
  id: string; studentId: string; feeAssignmentId: string; feeStructureId: string;
  academicYearId: string; classId: string;
  totalAmount: number; paidAmount: number; outstandingAmount: number;
  dueDate: string; status: FeeStatus;
  tenantId: string; createdAt: string; updatedAt: string;
}

export interface MonthlyFeeDto { month: string; collectedAmount: number; }

export interface FeeDashboardDto {
  totalAssigned: number; totalCollected: number; totalOutstanding: number;
  overdueCount: number;
  recentReceipts: FeeReceiptResponseDto[];
  monthlySummary: MonthlyFeeDto[];
}

export interface StudentFeeReportDto {
  studentId: string; studentName: string;
  totalAmount: number; paidAmount: number; outstandingAmount: number;
  ledgerEntries: StudentFeeLedgerDto[];
  receipts: FeeReceiptResponseDto[];
}
```

---

## 9. Angular Services (one per controller)

**All services** live in `core/services/`, accept `HttpClient` and `AuthService` (for `tenantId`), and return `Observable<T>` after unwrapping envelopes. `tenantId` is always resolved from `AuthService` unless the method explicitly needs a caller override (e.g., admin creating parent in another tenant — take from form).

### 9.1 `AuthService` → `AuthController` (`/api/auth`)
| Method | HTTP | URL | Body / Params | Returns |
|---|---|---|---|---|
| `login(req)` | POST | `/api/auth/login` | body: `LoginRequest` | `AuthResponse` |
| `forgotPassword(email, tenantId)` | POST | `/api/auth/forgot-password` | qp: `email`, `tenantId` | `string` |
| `verifyOtp(email, otp, tenantId)` | POST | `/api/auth/verify-otp` | qp: `email`, `otp`, `tenantId` | `AuthResponse` |

### 9.2 `AdminService` → `AdminController` (`/api/admin`) — role **ADMIN**
| Method | HTTP | URL | Params | Returns |
|---|---|---|---|---|
| `getDashboard()` | GET | `/api/admin/dashboard` | `tenantId` | `AdminDashboardDto` |
| `listStudents(page, limit, searchTerm?)` | GET | `/api/admin/students` | `tenantId, page, limit, searchTerm?` | `PaginatedResponse<StudentDto>` |
| `getStudent(id)` | GET | `/api/admin/students/{id}` | `tenantId` | `StudentDto` |
| `createStudent(body)` | POST | `/api/admin/students` | body: raw `Student` entity | `Student` |
| `createParent(body)` | POST | `/api/admin/parents` | body: `CreateParentRequest` | `UserDto` |
| `listTeachers(page, limit, searchTerm?)` | GET | `/api/admin/teachers` | `tenantId, page, limit, searchTerm?` | `PaginatedResponse<TeacherDto>` |
| `getTeacher(id)` | GET | `/api/admin/teachers/{id}` | `tenantId` | `TeacherDto` |
| `getTeacherSubjects(teacherId, page, limit)` | GET | `/api/admin/teachers/{teacherId}/subjects` | `tenantId, page, limit` | `PaginatedResponse<SubjectDto>` |
| `getTeacherClasses(teacherId, page, limit)` | GET | `/api/admin/teachers/{teacherId}/classes` | `tenantId, page, limit` | `PaginatedResponse<ClassEntityDto>` |
| `listFees(page, limit, status?)` | GET | `/api/admin/fees` | `tenantId, page, limit, status?` | `PaginatedResponse<StudentFeeLedgerDto>` |
| `listNotifications(page, limit)` | GET | `/api/admin/notifications` | `tenantId, page, limit` | `PaginatedResponse<Notification>` |

### 9.3 `TeacherLegacyService` → `TeacherController` (`/api/teacher`) — role **TEACHER, ADMIN**
| Method | HTTP | URL | Params | Returns |
|---|---|---|---|---|
| `getAttendanceByClassAndDate(classId, date)` | GET | `/api/teacher/attendance/{classId}/{date}` | `tenantId` | `LegacyAttendance[]` |
| `submitOrUpdateAttendance(body)` | POST | `/api/teacher/attendance` | body: `LegacyAttendanceUpdateRequest` | `LegacyAttendance[]` |
| `listHomework(teacherId, page, limit)` | GET | `/api/teacher/homework` | `teacherId, tenantId, page, limit` (page is **0-based** here!) | `PaginatedResponse<Homework>` |
| `createHomework(body)` | POST | `/api/teacher/homework` | body: `Homework` | `Homework` |

### 9.4 `ParentService` → `ParentController` (`/api/parent`) — role **PARENT, ADMIN**
| Method | HTTP | URL | Params | Returns |
|---|---|---|---|---|
| `myStudents(page, limit)` | GET | `/api/parent/my-students` | `tenantId, page, limit` | `PaginatedResponse<StudentDto>` |
| `studentFees(studentId)` | GET | `/api/parent/students/{studentId}/fees` | `tenantId` | `LegacyFee[]` |
| `busLocation(busId)` | GET | `/api/parent/bus-location/{busId}` | `tenantId` | `BusLocationDto` |

### 9.5 `SchoolService` → `SchoolController` (`/schools`) — authenticated
| Method | HTTP | URL | Params | Returns |
|---|---|---|---|---|
| `search(name?, code?)` | GET | `/schools` | `tenantId, name?, code?` | `School[]` |

### 9.6 `NotificationService` → `NotificationController` (`/api/notifications`)
| Method | HTTP | URL | Params | Returns |
|---|---|---|---|---|
| `markAsRead(id)` | PATCH | `/api/notifications/{id}/read` | `tenantId` | `Notification` |

### 9.7 `AdminAttendanceService` → `AdminAttendanceController` (`/api/v1/admin/attendance`) — role **ADMIN**
| Method | HTTP | URL | Params | Returns |
|---|---|---|---|---|
| `create(body)` | POST | `/api/v1/admin/attendance` | `tenantId`, body: `AttendanceRequest` | `AttendanceResponse` |
| `update(id, body)` | PUT | `/api/v1/admin/attendance/{id}` | `tenantId`, body: `AttendanceRequest` | `AttendanceResponse` |
| `delete(id)` | DELETE | `/api/v1/admin/attendance/{id}` | `tenantId` | `void` |
| `list(filters, page, limit)` | GET | `/api/v1/admin/attendance` | `tenantId, classId?, studentId?, attendanceDate?, attendanceType?, page, limit` | `PaginatedResponse<AttendanceResponse>` |
| `getById(id)` | GET | `/api/v1/admin/attendance/{id}` | `tenantId` | `AttendanceResponse` |
| `getDashboard(academicYearId?)` | GET | `/api/v1/admin/attendance/dashboard` | `tenantId, academicYearId?` | `AttendanceDashboardResponse` |
| `recalcSummary(studentId, month, year)` | POST | `/api/v1/admin/attendance/summary/recalculate` | `studentId, month, year, tenantId` | `AttendanceSummaryResponse` |
| `getAudit(filters, page, limit)` | GET | `/api/v1/admin/attendance/audit` | `tenantId, attendanceId?, fromDate?, toDate?, page, limit` | `PaginatedResponse<AttendanceAuditResponse>` |
| `dailyReport(date, classId?)` | GET | `/api/v1/admin/attendance/report/daily` | `tenantId, attendanceDate, classId?, page, limit` | `PaginatedResponse<AttendanceResponse>` |
| `monthlyReport(month, year, classId?)` | GET | `/api/v1/admin/attendance/report/monthly` | `tenantId, month, year, classId?, page, limit` | `PaginatedResponse<AttendanceSummaryResponse>` |
| `yearlyReport(year, classId?)` | GET | `/api/v1/admin/attendance/report/yearly` | `tenantId, year, classId?, page, limit` | `PaginatedResponse<AttendanceSummaryResponse>` |
| `classReport(classId, fromDate?, toDate?)` | GET | `/api/v1/admin/attendance/report/class/{classId}` | `tenantId, fromDate?, toDate?, page, limit` | `PaginatedResponse<AttendanceResponse>` |
| `studentReport(studentId, academicYearId?, fromDate?, toDate?)` | GET | `/api/v1/admin/attendance/report/student/{studentId}` | `tenantId, academicYearId?, fromDate?, toDate?, page, limit` | `PaginatedResponse<AttendanceResponse>` |
| `lowAttendanceReport(threshold, month, year, classId?)` | GET | `/api/v1/admin/attendance/report/low-attendance` | `tenantId, threshold=75, month, year, classId?, page, limit` | `PaginatedResponse<AttendanceSummaryResponse>` |
| `percentageReport(month, year, classId?)` | GET | `/api/v1/admin/attendance/report/percentage` | `tenantId, classId?, month, year, page, limit` | `PaginatedResponse<AttendanceSummaryResponse>` |

### 9.8 `TeacherAttendanceService` → `TeacherAttendanceController` (`/api/v1/teacher/attendance`) — role **TEACHER, ADMIN**
| Method | HTTP | URL | Params | Returns |
|---|---|---|---|---|
| `mark(body)` | POST | `/api/v1/teacher/attendance/mark` | `tenantId`, body: `AttendanceRequest` | `AttendanceResponse` |
| `update(id, body)` | PUT | `/api/v1/teacher/attendance/{id}` | `tenantId`, body — **same-day only** for teacher | `AttendanceResponse` |
| `getByClass(classId, date)` | GET | `/api/v1/teacher/attendance/class/{classId}` | `tenantId, attendanceDate` | `AttendanceResponse[]` |
| `getByStudent(studentId, fromDate?, toDate?)` | GET | `/api/v1/teacher/attendance/student/{studentId}` | `tenantId, fromDate?, toDate?, page, limit` | `PaginatedResponse<AttendanceResponse>` |
| `getToday()` | GET | `/api/v1/teacher/attendance/today` | `tenantId` | `AttendanceResponse[]` |

### 9.9 `ParentAttendanceService` → `ParentAttendanceController` (`/api/v1/parent/attendance`) — role **PARENT, ADMIN**
| Method | HTTP | URL | Params | Returns |
|---|---|---|---|---|
| `getMyChild(studentId, fromDate?, toDate?)` | GET | `/api/v1/parent/attendance` | `tenantId, studentId, fromDate?, toDate?, page, limit` | `PaginatedResponse<AttendanceResponse>` |
| `getMonthly(studentId, month, year)` | GET | `/api/v1/parent/attendance/monthly` | `tenantId, studentId, month, year` | `AttendanceSummaryResponse` |
| `getYearly(studentId, year)` | GET | `/api/v1/parent/attendance/yearly` | `tenantId, studentId, year` | `YearlySummaryResponse` |
| `getSummary(studentId)` | GET | `/api/v1/parent/attendance/summary` | `tenantId, studentId` | `AttendanceSummaryResponse` |

### 9.10 Fee Services (all under `/api/admin/fee/**` are **ADMIN** only)

**`AcademicYearService`** → `/api/admin/fee/academic-years`
| Method | HTTP | URL | Returns |
|---|---|---|---|
| `create(body)` | POST | `` | `AcademicYearResponseDto` |
| `update(id, body)` | PUT | `/{id}` | `AcademicYearResponseDto` |
| `deactivate(id)` | PATCH | `/{id}/deactivate` | `AcademicYearResponseDto` |
| `getById(id)` | GET | `/{id}` | `AcademicYearResponseDto` |
| `list(page, limit)` | GET | `` | `PaginatedResponse<AcademicYearResponseDto>` |

**`FeeCategoryService`** → `/api/admin/fee/categories`
| `create(body)` POST `` → `FeeCategoryResponseDto` |
| `update(id, body)` PUT `/{id}` → `FeeCategoryResponseDto` |
| `softDelete(id)` DELETE `/{id}` → `void` |
| `list()` GET `` → `FeeCategoryResponseDto[]` |
| `getById(id)` GET `/{id}` → `FeeCategoryResponseDto` |

**`FeeTermService`** → `/api/admin/fee/terms`
| `create(body)` POST `` → `FeeTermResponseDto` |
| `update(id, body)` PUT `/{id}` → `FeeTermResponseDto` |
| `listByAcademicYear(academicYearId)` GET `` (qp `academicYearId, tenantId`) → `FeeTermResponseDto[]` |
| `getById(id)` GET `/{id}` → `FeeTermResponseDto` |

**`FeeStructureService`** → `/api/admin/fee/structures`
| `create(body)` POST `` → `FeeStructureResponseDto` |
| `update(id, body)` PUT `/{id}` → `FeeStructureResponseDto` |
| `delete(id)` DELETE `/{id}` → `void` (204) |
| `getById(id)` GET `/{id}` → `FeeStructureResponseDto` |
| `list(academicYearId?, classId?, feeCategoryId?, page, limit)` GET `` → `PaginatedResponse<FeeStructureResponseDto>` |

**`FeeAssignmentService`** → `/api/admin/fee/assignments`
| `assignToClass(body)` POST `/class` (body `ClassFeeAssignmentRequestDto`) → `FeeAssignmentResponseDto[]` |
| `assignToStudent(body)` POST `/student` (body `StudentFeeAssignmentRequestDto`) → `FeeAssignmentResponseDto` |
| `remove(id)` DELETE `/{id}` → `void` |
| `list(studentId?, classId?)` GET `` → `FeeAssignmentResponseDto[]` (empty if neither param) |

**`FeeReceiptService`** → `/api/admin/fee/receipts` — receipts are **immutable** (PUT/PATCH/DELETE return 405)
| `generate(body)` POST `` (body `FeeReceiptRequestDto`) → `FeeReceiptResponseDto` |
| `getById(id)` GET `/{id}` → `FeeReceiptResponseDto` |
| `list(studentId?, page, limit)` GET `` → `PaginatedResponse<FeeReceiptResponseDto>` |

**`FeeDashboardService`** → `/api/admin/fee/dashboard`
| `getDashboard(academicYearId?)` GET `` → `FeeDashboardDto` |

**`FeeReportService`** → `/api/admin/fee/reports`
| `studentReport(studentId, academicYearId?)` GET `/student/{studentId}` → `StudentFeeReportDto` |
| `classReport(classId, academicYearId?, page, limit)` GET `/class/{classId}` → `PaginatedResponse<StudentFeeLedgerDto>` |
| `outstanding(academicYearId?, classId?, page, limit)` GET `/outstanding` → `PaginatedResponse<StudentFeeLedgerDto>` |
| `paid(academicYearId?, classId?, page, limit)` GET `/paid` → `PaginatedResponse<StudentFeeLedgerDto>` |
| `overdue(academicYearId?, classId?, page, limit)` GET `/overdue` → `PaginatedResponse<StudentFeeLedgerDto>` |

**`StudentFeeLedgerService`** → `/api/admin/fee/ledger`
| `getByStudent(studentId, academicYearId?, status?, page, limit)` GET `/{studentId}` → `PaginatedResponse<StudentFeeLedgerDto>` |
| `getAll(status?, classId?, academicYearId?, page, limit)` GET `` → `PaginatedResponse<StudentFeeLedgerDto>` |

**`FeeParentService`** → `/api/parent/fee` — role **PARENT, ADMIN**; server validates ownership → **403** if the parent does not own the student
| `summary(studentId, academicYearId?, page, limit)` GET `/summary` → `PaginatedResponse<StudentFeeLedgerDto>` |
| `receipts(studentId, page, limit)` GET `/receipts/{studentId}` → `PaginatedResponse<FeeReceiptResponseDto>` |

**`FeeTeacherService`** → `/api/teacher/fee` — role **TEACHER, ADMIN**; 403 if teacher not assigned to class
| `classSummary(classId, academicYearId?, page, limit)` GET `/summary` → `PaginatedResponse<StudentFeeLedgerDto>` |

---

## 10. Feature Modules & Routes

### `/auth`
| Path | Guard | Component | Purpose | Key UI |
|---|---|---|---|---|
| `login` | guestGuard | `LoginPageComponent` | Username/password login | Reactive form, "forgot password" link, backend error surface |
| `forgot-password` | guestGuard | `ForgotPasswordPageComponent` | Email + tenantId → OTP flow | Two inputs, submit → toast |
| `verify-otp` | guestGuard | `VerifyOtpPageComponent` | Email + OTP + tenantId | 6-digit OTP input, resend link |

### `/admin` (roleGuard `['ADMIN']`)
| Path | Component | Purpose | UI |
|---|---|---|---|
| `dashboard` | `AdminDashboardComponent` | KPI cards (`AdminDashboardDto`) | Material cards + small charts |
| `students` | `StudentListComponent` | Paginated + search students | `SharedDataTableComponent`, debounced search input |
| `students/new` | `StudentCreateComponent` | Create student (raw `Student` entity) | Reactive form |
| `students/:id` | `StudentDetailComponent` | Show one student | Header + tabs (info, fees, attendance) |
| `teachers` | `TeacherListComponent` | Paginated + search teachers | table |
| `teachers/:id` | `TeacherDetailComponent` | Teacher info + tabs | Tabs load `getTeacherSubjects` / `getTeacherClasses` |
| `parents/new` | `CreateParentComponent` | Create parent (see §11 form) | Full form + validators |
| `schools` | `SchoolSearchComponent` | Search by name/code | Filters + list |
| `notifications` | `NotificationListComponent` | Paginated notifications, mark-as-read action | table + row actions |
| `fees` | `AdminFeesShortcutComponent` | Redirect to `/fees-admin` | — |
| `attendance` | `AdminAttendanceHomeComponent` | Tabs: List / Create / Dashboard / Audit / Reports | See below |
| `attendance/list` | `AttendanceListComponent` | Filters (class/student/date/type) + paginated | data-table, edit/delete row actions |
| `attendance/new` | `AttendanceCreateComponent` | Full CRUD | Reactive form |
| `attendance/edit/:id` | `AttendanceEditComponent` | Edit any day (admin) | Reactive form |
| `attendance/dashboard` | `AttendanceDashboardComponent` | Cards + pie chart of today, list of <75% students | Chart.js pie + list |
| `attendance/audit` | `AttendanceAuditComponent` | Filters (attendanceId, fromDate, toDate) | data-table |
| `attendance/reports` | `AttendanceReportsComponent` | Segmented view: daily/monthly/yearly/class/student/low/percentage | tables + export CSV |

### `/teacher` (roleGuard `['TEACHER','ADMIN']`)
| Path | Component | Purpose |
|---|---|---|
| `dashboard` | `TeacherDashboardComponent` | Today's assigned classes, quick mark-attendance |
| `attendance/legacy/:classId` | `LegacyAttendanceMarkComponent` | Table of class students with PRESENT/ABSENT/LEAVE toggles for a chosen date; uses `TeacherLegacyService.submitOrUpdateAttendance` |
| `attendance/mark` | `AttendanceMarkComponent` | Mark v1 attendance (`AttendanceRequest`) |
| `attendance/class/:classId` | `AttendanceClassViewComponent` | View class attendance for a chosen date |
| `attendance/student/:studentId` | `AttendanceStudentHistoryComponent` | Paginated history |
| `attendance/today` | `AttendanceTodayComponent` | Read `getToday()` |
| `homework` | `HomeworkListComponent` | Paginated (note **0-based page** for this endpoint) |
| `homework/new` | `HomeworkCreateComponent` | Reactive form for `Homework` |
| `fees/class` | `TeacherClassFeeSummaryComponent` | Class fee summary |

### `/parent` (roleGuard `['PARENT','ADMIN']`)
| Path | Component | Purpose |
|---|---|---|
| `dashboard` | `ParentDashboardComponent` | Overview: cards per child (attendance %, dues) |
| `my-students` | `MyStudentsComponent` | Paginated list of own children |
| `students/:studentId/fees` | `StudentLegacyFeesComponent` | Legacy fees list |
| `students/:studentId/attendance` | `ParentChildAttendanceComponent` | Paginated list + monthly/yearly summary cards + current summary |
| `bus/:busId` | `BusLocationComponent` | Show BusLocation card (map optional) |
| `fees/summary/:studentId` | `ParentFeeSummaryComponent` | Ledger summary (paginated) |
| `fees/receipts/:studentId` | `ParentReceiptListComponent` | Paginated receipts; row → print receipt |

### `/fees-admin` (roleGuard `['ADMIN']`)
| Path | Component | Purpose |
|---|---|---|
| `academic-years` | `AcademicYearListComponent` | CRUD + deactivate |
| `academic-years/new` \| `:id/edit` | `AcademicYearFormComponent` | Reactive form |
| `categories` | `FeeCategoryListComponent` | Full CRUD (soft delete) |
| `categories/new` \| `:id/edit` | `FeeCategoryFormComponent` | Form |
| `terms` | `FeeTermListComponent` | List by academic year |
| `terms/new` \| `:id/edit` | `FeeTermFormComponent` | Form with frequency enum |
| `structures` | `FeeStructureListComponent` | Filters: academic year/class/category |
| `structures/new` \| `:id/edit` | `FeeStructureFormComponent` | Form |
| `assignments` | `FeeAssignmentListComponent` | Toggle Student/Class filter |
| `assignments/class/new` | `AssignToClassComponent` | Form |
| `assignments/student/new` | `AssignToStudentComponent` | Form |
| `receipts` | `ReceiptListComponent` | Paginated, filter by studentId |
| `receipts/new` | `ReceiptCreateComponent` | Form; on success open **PrintReceipt** dialog |
| `receipts/:id` | `ReceiptDetailComponent` | Show + print button |
| `ledger` | `LedgerListComponent` | Filters (status, class, academic year) |
| `ledger/:studentId` | `StudentLedgerComponent` | Student ledger + status filter |
| `dashboard` | `FeeDashboardComponent` | KPI cards, monthly bar chart, recent receipts table |
| `reports/student/:studentId` | `StudentFeeReportComponent` | Aggregate report |
| `reports/class/:classId` | `ClassFeeReportComponent` | Paginated |
| `reports/outstanding` | `OutstandingReportComponent` | table |
| `reports/paid` | `PaidReportComponent` | table |
| `reports/overdue` | `OverdueReportComponent` | table |

---

## 11. Reusable UI Components (in `shared/`)

- **`SharedDataTableComponent`** — inputs: `columns`, `dataSource$`, `total`, `page`, `limit`, `loading`; outputs: `pageChange`, `sortChange`, `filterChange`. Wraps `MatTable` + `MatPaginator` + `MatSort`.
- **`ConfirmDialogComponent`** — service `ConfirmService.confirm({ title, message, confirmText?, danger? })`.
- **`ToastService`** — thin wrapper around `MatSnackBar` (`success`, `error`, `info`).
- **`LoadingSpinnerComponent`** — global + inline modes; connect to a `LoaderService`.
- **`PageHeaderComponent`** — title, breadcrumbs, action slot.
- **`EmptyStateComponent`** — illustration + message + optional CTA.
- **`FileUploadComponent`** — for homework attachments, avatars.
- **`DateRangePickerComponent`** — wraps Material date range.
- **`RoleBadgeComponent`** — colored chip per role.
- **`StatusChipComponent`** — inputs: `status`, `map` (e.g. FeeStatus → color).
- **`PrintReceiptComponent`** — printable component with `@media print` styles for `FeeReceiptResponseDto`.
- **`HasRoleDirective`** — `*hasRole="['ADMIN','TEACHER']"` to show/hide UI parts.
- **Pipes**: `currencyInr` (`₹1,23,456.00`), `dateFmt`, `enumLabel` (e.g., `MEDICAL_LEAVE` → "Medical Leave").

---

## 12. Forms & Validation (mirror backend)

### Canonical example — `CreateParentRequest`
```ts
this.form = this.fb.nonNullable.group({
  name:     ['', [Validators.required, Validators.minLength(2)]],
  email:    ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  phone:    [''],
  avatarUrl:[''],
  schoolId: ['', Validators.required],
  tenantId: [this.auth.tenantId(), Validators.required],
});
```

### Rules to enforce per DTO (extracted from backend annotations)
- `LoginRequest`: `username` NotBlank, `password` NotBlank.
- `CreateParentRequest`: `name`, `email` (also Email), `password`, `schoolId`, `tenantId` all NotBlank.
- `AttendanceRequest`: `studentId`, `classId` NotBlank; `attendanceDate` NotNull and **must NOT be in the future** (add `Validators` custom `notFutureDateValidator`); `attendanceType` NotNull.
- `AcademicYearRequestDto`: `name` NotBlank; `startDate`, `endDate` NotNull; validate `endDate > startDate` client-side.
- `FeeCategoryRequestDto`: `name` NotBlank.
- `FeeTermRequestDto`: `academicYearId`, `label` NotBlank; `frequency` NotNull (dropdown of `FeeTermFrequency`); dates optional but if both given validate range.
- `FeeStructureRequestDto`: all IDs NotBlank; `amount` NotNull + Positive (`Validators.min(0.01)`); `dueDate` NotNull.
- `ClassFeeAssignmentRequestDto` / `StudentFeeAssignmentRequestDto`: IDs NotBlank; `overrideAmount` Positive if provided.
- `FeeReceiptRequestDto`: `ledgerEntryId` NotBlank; `amountPaid` NotNull + Positive; `receiptDate` NotNull.

Add a `FormErrorPipe` / helper to translate `ValidationErrors` to messages.

---

## 13. State Management

Per-feature service exposes `BehaviorSubject`s:
```ts
@Injectable({ providedIn: 'root' })
export class AttendanceStore {
  private readonly _list$ = new BehaviorSubject<AttendanceResponse[]>([]);
  readonly list$ = this._list$.asObservable();
  private readonly _total$ = new BehaviorSubject(0);
  readonly total$ = this._total$.asObservable();
  // load(), select(), etc.
}
```
Global `AuthStore` holds `user$`, `tenantId$`, `roles$`, `isAuthenticated$`.

Justification: CRUD app with minimal cross-feature state; NgRx boilerplate isn't warranted. Signals are acceptable for local component state.

---

## 14. Error Handling & Notifications

- `errorInterceptor` consumes `ApiResponse` shape: prefer `err.error?.message`, fall back to `err.error?.error`, then generic.
- Print HTTP status in dev console only.
- 401 → clear tokens, redirect `/auth/login` with `returnUrl`.
- 403 → snack "Access denied" (backend sends via `AccessDeniedException` mapped by `GlobalExceptionHandler`).
- 405 on receipts (`Receipts are immutable`) → show explanatory dialog.
- Domain-specific error codes to surface (from `GlobalExceptionHandler` — verify presence): `VALIDATION_ERROR`, `NOT_FOUND`, `ACCESS_DENIED`, `AUTH_ERROR`, `METHOD_NOT_ALLOWED`.

---

## 15. Role-Based Navigation

`MainLayoutComponent` reads `AuthStore.roles$` and renders a Material `mat-sidenav` from a `NAV_CONFIG` list. Each item: `{ label, icon, route, roles: Role[] }`.

Example groups:
- **ADMIN**: Dashboard, Students, Teachers, Parents (+Create), Schools, Notifications, Attendance ▸ (List/Create/Dashboard/Audit/Reports), Fees ▸ (Academic Years/Categories/Terms/Structures/Assignments/Receipts/Ledger/Dashboard/Reports).
- **TEACHER**: Dashboard, Attendance ▸ (Mark/Today/Class/Student/Legacy), Homework, Class Fees.
- **PARENT**: Dashboard, My Students, Attendance, Fees ▸ (Summary/Receipts), Bus Location.

Icons: use Material icons (`dashboard`, `people`, `school`, `event_available`, `payments`, `receipt_long`, `directions_bus`).

---

## 16. Styling & Theming

- Material theme in `styles/_theme.scss` (Indigo/Pink or School Blue).
- Light & dark toggle in top bar; persist choice in `localStorage`.
- Responsive: `flex-layout` alternatives with CSS grid; sidenav collapses under 960 px.
- Print stylesheet (`@media print`) hides `.no-print` and renders `<app-print-receipt>` full-page A5 for `FeeReceiptResponseDto`.
- Global loader overlays with `MatProgressSpinner`.

---

## 17. Build/Run Steps

```bash
# add packages
npm i @angular/material @angular/cdk @angular/animations chart.js ng2-charts date-fns
npm i -D eslint @angular-eslint/schematics prettier eslint-config-prettier

ng add @angular/material            # if not already added
ng generate @angular-eslint/schematics:add-eslint-to-project

# dev
ng serve --proxy-config proxy.conf.json

# production
ng build --configuration production
```

Ensure `angular.json` has `"strict": true` and includes the SCSS theme. Register interceptors and animations in `app.config.ts` using `provideHttpClient(withInterceptors([...]))` and `provideAnimationsAsync()`.

---

## 18. Acceptance Criteria

- [ ] Every endpoint listed in §9 has a service method and at least one component that calls it.
- [ ] All routes are gated by `authGuard` + appropriate `roleGuard`; unauthenticated users are redirected to `/auth/login`.
- [ ] All Reactive Forms enforce the exact validation rules from §12.
- [ ] JWT is stored in `localStorage`, attached via `authInterceptor`, and refreshed on 401 (or user is signed out).
- [ ] `tenantId` is auto-injected on every request that requires it.
- [ ] Pagination is 1-based (except `/api/teacher/homework` which is 0-based — documented in the service).
- [ ] Fee dashboard renders a bar chart for `monthlySummary` and cards for totals.
- [ ] Attendance dashboard renders a pie of PRESENT/ABSENT/LATE/LEAVE/HOLIDAY and a low-attendance list.
- [ ] Receipt list has a print action that opens `PrintReceiptComponent` and calls `window.print()`.
- [ ] Immutable receipt attempts (PUT/PATCH/DELETE) surface the 405 message via dialog/snackbar.
- [ ] `HasRoleDirective` hides admin-only actions from teachers/parents.
- [ ] No `any` in the codebase; `strict` TS compiles clean; ESLint & Prettier pass.
- [ ] All lists have empty-state + loading-spinner + error-state UI.
- [ ] Light/dark theme toggle persists.
- [ ] All dates sent/received are ISO strings matching backend `LocalDate` / `LocalDateTime`.

---

## 19. Implementation Order (Phases)

1. **Scaffolding & Core**: env config, `ApiResponse`/`PaginatedResponse`, interceptors, guards, `AuthStore`, `TokenService`, layouts, main routing skeleton, Material theme.
2. **Auth**: Login, Forgot Password, Verify OTP; role-based post-login redirect (`/admin/dashboard`, `/teacher/dashboard`, `/parent/dashboard`).
3. **Shared UI**: data-table, dialogs, toast, page header, empty state, pipes, `HasRoleDirective`, print-receipt.
4. **Admin CRUD**: Dashboard, Students, Teachers (+ subjects/classes tabs), Create Parent, Schools, Notifications.
5. **Attendance (v1)**: Admin (List/Create/Edit/Delete/Dashboard/Audit/Reports), Teacher (Mark/Today/Class/Student History), Parent (Child list/Monthly/Yearly/Summary), Legacy teacher attendance.
6. **Fees**: Academic Years → Categories → Terms → Structures → Assignments → Receipts → Ledger → Dashboard → Reports; Parent Fees; Teacher Class Fee Summary.
7. **Dashboards & Charts**: hook Chart.js into Admin Dashboard, Attendance Dashboard, Fee Dashboard.
8. **Polish**: theming, dark mode, responsive tweaks, print styles, empty/loading/error states, unit tests for services & guards, e2e smoke of login + one page per role.

---

**End of Prompt.** Do not add features not described here without confirming the corresponding backend endpoint exists.