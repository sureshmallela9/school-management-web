# Angular Implementation Prompt — Attendance Module

## Before Writing Any Code

Read the existing Angular project thoroughly:
- Find how **Teacher**, **Admin**, and **Parent** modules are already structured
- Find existing service patterns, component patterns, routing, form validation, pagination, API call patterns, role guards, table patterns, toast/notifications, and HTTP interceptors
- **Reuse those exact patterns** for all Attendance components and services
- Do NOT introduce new folder structures, libraries, or coding styles

---

## Backend Base URL

```
http://localhost:2020
```

All requests require:
```
Authorization: Bearer <jwt_token>      (handled by existing HTTP interceptor)
Content-Type: application/json
```

`tenantId` must be sent as a **query param** on every call. Extract it from the stored auth state (JWT or localStorage), using the same pattern the rest of the project already uses.

---

## Standard Response Shapes

### Single item `ApiResponse<T>`
```json
{ "success": true, "data": { ... }, "message": "...", "error": null }
```

### Paginated `PaginatedResponse<T>`
```json
{
  "success": true,
  "data": [ ... ],
  "total": 120,
  "page": 1,
  "limit": 20,
  "totalPages": 6
}
```
> `page` is **1-based**. Pass `page=1` for the first page.

### Error
```json
{ "success": false, "data": null, "message": "...", "error": "detail", "code": 404 }
```

---

## TypeScript Models

```typescript
// Allowed attendance types — use as dropdown options
export type AttendanceType =
  | 'PRESENT' | 'ABSENT' | 'LATE'
  | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'MEDICAL_LEAVE';

// Full attendance record returned by API
export interface AttendanceRecord {
  id: string;
  studentId: string;
  teacherId: string | null;
  classId: string;
  sectionId: string | null;
  academicYearId: string | null;
  attendanceDate: string;        // ISO date "YYYY-MM-DD"
  attendanceType: AttendanceType;
  remarks: string | null;
  markedAt: string;              // ISO datetime
  markedBy: string;
  status: string;                // "ACTIVE"
  tenantId: string;
  version: number;
}

// Request body for create/update
export interface AttendanceRequest {
  studentId: string;             // required
  classId: string;               // required
  attendanceDate: string;        // required, "YYYY-MM-DD", cannot be future date
  attendanceType: AttendanceType; // required
  teacherId?: string;
  sectionId?: string;
  academicYearId?: string;
  remarks?: string;
}

// Monthly summary
export interface AttendanceSummary {
  studentId: string;
  monthVal: number;
  yearVal: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  halfDays: number;
  medicalLeaveDays: number;
  workingDays: number;
  attendancePercentage: number;  // BigDecimal from backend
}

// Yearly aggregated summary
export interface YearlySummary {
  studentId: string;
  year: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalWorkingDays: number;
  overallPercentage: number;
}

// Dashboard response
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

// Audit log entry
export interface AttendanceAudit {
  id: string;
  attendanceId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changedBy: string;
  changedAt: string;             // ISO datetime
  previousValue: string | null;
  newValue: string | null;
}
```

---

## All API Endpoints — Full Contract

### ADMIN APIs (`/api/v1/admin/attendance`)

**1. List Attendance with Filters**
```
GET /api/v1/admin/attendance
Query:
  tenantId      required
  classId       optional
  studentId     optional
  attendanceDate optional  (YYYY-MM-DD)
  attendanceType optional  (PRESENT | ABSENT | LATE | HALF_DAY | LEAVE | HOLIDAY | MEDICAL_LEAVE)
  page          default 1 (1-based)
  limit         default 20

Response: PaginatedResponse<AttendanceRecord>
HTTP 200
```

**2. Get Single Record**
```
GET /api/v1/admin/attendance/{id}
Query: tenantId required
Response: ApiResponse<AttendanceRecord>
HTTP 200 | 404
```

**3. Create Attendance Record**
```
POST /api/v1/admin/attendance
Query: tenantId required
Body: AttendanceRequest
  Required: studentId, classId, attendanceDate, attendanceType
  Optional: teacherId, sectionId, academicYearId, remarks

Response: ApiResponse<AttendanceRecord>
HTTP 201

Errors:
  400 — missing required fields
  409 — duplicate record (same student + date + tenant already exists)
  422 — attendanceDate is in the future
```

**4. Update Attendance Record**
```
PUT /api/v1/admin/attendance/{id}
Query: tenantId required
Body: AttendanceRequest (same as create)
Admin can update records from ANY past date.

Response: ApiResponse<AttendanceRecord>
HTTP 200 | 404
```

**5. Delete Attendance Record**
```
DELETE /api/v1/admin/attendance/{id}
Query: tenantId required
NOTE: Hard delete — permanent.

Response: ApiResponse<null>
HTTP 200 | 404
```

**6. Dashboard**
```
GET /api/v1/admin/attendance/dashboard
Query:
  tenantId        required
  academicYearId  optional

Response: ApiResponse<AttendanceDashboard>
HTTP 200

Dashboard contains:
  - Today's present/absent/late/leave/holiday counts
  - Total students
  - attendancePercentageToday
  - studentsBelow75Percent list (studentId + percentage)
```

**7. Recalculate Monthly Summary**
```
POST /api/v1/admin/attendance/summary/recalculate
Query:
  studentId  required
  month      required (1-12)
  year       required
  tenantId   required

Response: ApiResponse<AttendanceSummary>
HTTP 200
```

**8. Audit Trail**
```
GET /api/v1/admin/attendance/audit
Query:
  tenantId     required
  attendanceId optional (filter by specific record)
  fromDate     optional (ISO datetime)
  toDate       optional (ISO datetime)
  page         default 1
  limit        default 20

Response: PaginatedResponse<AttendanceAudit>
HTTP 200
```

**9. Daily Report**
```
GET /api/v1/admin/attendance/report/daily
Query:
  tenantId       required
  attendanceDate required (YYYY-MM-DD)
  classId        optional
  page default 1, limit default 40

Response: PaginatedResponse<AttendanceRecord>
```

**10. Monthly Report**
```
GET /api/v1/admin/attendance/report/monthly
Query:
  tenantId required
  month    required (1-12)
  year     required
  classId  optional
  page default 1, limit default 40

Response: PaginatedResponse<AttendanceSummary>
```

**11. Yearly Report**
```
GET /api/v1/admin/attendance/report/yearly
Query:
  tenantId required
  year     required
  classId  optional
  page default 1, limit default 40

Response: PaginatedResponse<AttendanceSummary>
```

**12. Class Report**
```
GET /api/v1/admin/attendance/report/class/{classId}
Query:
  tenantId required
  fromDate optional (YYYY-MM-DD)
  toDate   optional (YYYY-MM-DD)
  page default 1, limit default 40

Response: PaginatedResponse<AttendanceRecord>
```

**13. Student Report**
```
GET /api/v1/admin/attendance/report/student/{studentId}
Query:
  tenantId       required
  academicYearId optional
  fromDate       optional (YYYY-MM-DD)
  toDate         optional (YYYY-MM-DD)
  page default 1, limit default 40

Response: PaginatedResponse<AttendanceRecord>
```

**14. Low Attendance Report**
```
GET /api/v1/admin/attendance/report/low-attendance
Query:
  tenantId  required
  threshold default 75 (percentage threshold)
  month     required (1-12)
  year      required
  classId   optional
  page default 1, limit default 20

Response: PaginatedResponse<AttendanceSummary>
```

**15. Percentage Report (sorted ascending)**
```
GET /api/v1/admin/attendance/report/percentage
Query:
  tenantId required
  classId  optional
  month    required
  year     required
  page default 1, limit default 40

Response: PaginatedResponse<AttendanceSummary>
```

---

### TEACHER APIs (`/api/v1/teacher/attendance`)

**16. Mark Attendance**
```
POST /api/v1/teacher/attendance/mark
Query: tenantId required
Body: AttendanceRequest (same structure as admin create)

BUSINESS RULE: Teacher can only mark attendance for students in their
assigned classes. Backend validates this and rejects with 403 if not.

Response: ApiResponse<AttendanceRecord>
HTTP 201

Errors:
  403 — student not in teacher's assigned class
  409 — attendance already marked for this student today
  422 — attendanceDate is in the future
```

**17. Update Attendance (same-day only)**
```
PUT /api/v1/teacher/attendance/{id}
Query: tenantId required
Body: AttendanceRequest

BUSINESS RULE: Teachers can only edit records from TODAY.
Editing past records returns an error (only Admin can edit past records).

Response: ApiResponse<AttendanceRecord>
HTTP 200 | 403 (past date) | 404
```

**18. Get Class Attendance for a Date**
```
GET /api/v1/teacher/attendance/class/{classId}
Query:
  tenantId       required
  attendanceDate required (YYYY-MM-DD)

Response: ApiResponse<AttendanceRecord[]>  (plain list, not paginated)
HTTP 200
```

**19. Get Student Attendance History**
```
GET /api/v1/teacher/attendance/student/{studentId}
Query:
  tenantId required
  fromDate optional (YYYY-MM-DD)
  toDate   optional (YYYY-MM-DD)
  page default 1, limit default 20

Response: PaginatedResponse<AttendanceRecord>
```

**20. Get Today's Attendance for All My Classes**
```
GET /api/v1/teacher/attendance/today
Query: tenantId required

NOTE: Returns attendance for ALL classes assigned to the authenticated teacher.
TeacherId resolved from JWT automatically.

Response: ApiResponse<AttendanceRecord[]>  (plain list, not paginated)
HTTP 200
```

---

### PARENT APIs (`/api/v1/parent/attendance`)

**21. Get Child's Attendance (paginated)**
```
GET /api/v1/parent/attendance
Query:
  tenantId  required
  studentId required  ← MUST be one of the parent's own children
  fromDate  optional (YYYY-MM-DD)
  toDate    optional (YYYY-MM-DD)
  page default 1, limit default 20

SECURITY: Backend verifies student.parentId == authenticatedUser.id
Returns HTTP 403 if the studentId does not belong to the authenticated parent.

Response: PaginatedResponse<AttendanceRecord>
HTTP 200 | 403
```

**22. Monthly Summary**
```
GET /api/v1/parent/attendance/monthly
Query:
  tenantId  required
  studentId required (own child only, 403 if not)
  month     required (1-12)
  year      required

Response: ApiResponse<AttendanceSummary>
HTTP 200 | 403
```

**23. Yearly Summary**
```
GET /api/v1/parent/attendance/yearly
Query:
  tenantId  required
  studentId required (own child only)
  year      required

Response: ApiResponse<YearlySummary>
HTTP 200 | 403
```

**24. Current Month Summary Card**
```
GET /api/v1/parent/attendance/summary
Query:
  tenantId  required
  studentId required (own child only)

NOTE: No month/year params needed — backend uses current calendar month.

Response: ApiResponse<AttendanceSummary>
HTTP 200 | 403
```

---

## Role-Based UI Behaviour

### ADMIN role — Full Access

**Pages to implement:**
1. **Attendance Dashboard** — shows `AttendanceDashboard` card with today's counts + pie/bar chart + `studentsBelow75Percent` alert list
2. **Attendance List** — filterable table: filters for classId, studentId, attendanceDate, attendanceType; paginated; inline Create/Edit/Delete actions
3. **Create/Edit Attendance Form** — all fields, date picker (no future dates), attendanceType dropdown, remarks
4. **Audit Trail Page** — read-only paginated table with filters for attendanceId, fromDate, toDate
5. **Reports Section** with sub-pages:
   - Daily Report
   - Monthly Summary Report
   - Yearly Summary Report
   - Class Report
   - Student Report
   - Low Attendance Report (adjustable threshold, default 75%)
   - Percentage Report

**Buttons visible to Admin:**
- Create New Attendance
- Edit any record (any date)
- Delete (permanent — show confirmation dialog)
- Recalculate Summary (per student, month, year)
- View Audit Trail
- All Report links

### TEACHER role — Mark & View Own Classes

**Pages to implement:**
1. **Mark Attendance Page** — select a date + class → loads today's class attendance → teacher marks each student PRESENT/ABSENT/LATE etc. → save calls POST `/mark`
2. **Today's Attendance** — quick view of records already marked for today across all assigned classes (calls `/today`)
3. **Class Attendance Viewer** — select class + date → view records (calls `/class/{classId}`)
4. **Student History** — search a student and view paginated history with date range filter

**Buttons visible to Teacher:**
- Mark Attendance (TODAY only for new records)
- Edit Attendance (TODAY only — past records show read-only)
- NO delete button
- NO dashboard/reports

**Important UI rules for Teacher:**
- Date picker for "Mark Attendance" should **default to today** and **disable future dates**
- The "Edit" button on attendance records should only be enabled if `attendanceDate === today`
- Show a tooltip or message "Only today's attendance can be edited" on past records

### PARENT role — Read Only for Own Children

**Pages to implement:**
1. **Attendance Summary Card** — show current month summary for the selected child (calls `/summary`)
2. **Attendance History** — paginated list of records for selected child (calls `/`)
3. **Monthly Summary** — month/year picker → shows presentDays, absentDays, lateDays, attendancePercentage
4. **Yearly Summary** — year picker → shows totalPresent, totalAbsent, totalLate, overallPercentage

**If parent has multiple children:**
- Add a child selector (dropdown of their children from `GET /api/parent/my-students`)
- All attendance endpoints require `studentId` — use the selected child's ID

**Buttons visible to Parent:**
- NO create/edit/delete buttons
- Child selector dropdown (if multiple children)
- Month/Year navigation

### STUDENT role
- No attendance endpoints exist for students
- Do NOT add any attendance pages for the STUDENT role

---

## Validation Rules (implement in Angular forms)

| Field | Rule |
|-------|------|
| `studentId` | Required |
| `classId` | Required |
| `attendanceDate` | Required, must not be a future date |
| `attendanceType` | Required, must be one of: `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY`, `LEAVE`, `HOLIDAY`, `MEDICAL_LEAVE` |
| `remarks` | Optional |
| `teacherId` | Optional (auto-filled from JWT for teacher role) |

---

## Error Handling

| Code | Scenario | User Message |
|------|----------|-------------|
| 400 | Validation failed | Show field errors |
| 403 | Not your student / Teacher: not your class / Teacher: editing past date | "Access denied" |
| 404 | Record not found | "Attendance record not found" |
| 409 | Duplicate — attendance already marked for this student on this date | "Attendance already marked for this student today" |
| 422 | Future date submitted | "Attendance date cannot be in the future" |
| 500 | Server error | "Something went wrong, please try again" |

---

## Angular Service Methods to Implement

Follow the existing service pattern in the project. Create `AttendanceService` with these methods:

```typescript
// Admin
getAttendanceList(filters: AttendanceFilters, page: number, limit: number): Observable<PaginatedResponse<AttendanceRecord>>
getAttendanceById(id: string, tenantId: string): Observable<ApiResponse<AttendanceRecord>>
createAttendance(request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>>
updateAttendance(id: string, request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>>
deleteAttendance(id: string, tenantId: string): Observable<ApiResponse<null>>
getDashboard(tenantId: string, academicYearId?: string): Observable<ApiResponse<AttendanceDashboard>>
recalculateSummary(studentId: string, month: number, year: number, tenantId: string): Observable<ApiResponse<AttendanceSummary>>
getAuditTrail(tenantId: string, filters: AuditFilters, page: number, limit: number): Observable<PaginatedResponse<AttendanceAudit>>

// Reports
getDailyReport(tenantId: string, date: string, classId?: string, page?: number): Observable<PaginatedResponse<AttendanceRecord>>
getMonthlyReport(tenantId: string, month: number, year: number, classId?: string): Observable<PaginatedResponse<AttendanceSummary>>
getYearlyReport(tenantId: string, year: number, classId?: string): Observable<PaginatedResponse<AttendanceSummary>>
getClassReport(classId: string, tenantId: string, fromDate?: string, toDate?: string): Observable<PaginatedResponse<AttendanceRecord>>
getStudentReport(studentId: string, tenantId: string, fromDate?: string, toDate?: string): Observable<PaginatedResponse<AttendanceRecord>>
getLowAttendanceReport(tenantId: string, month: number, year: number, threshold?: number, classId?: string): Observable<PaginatedResponse<AttendanceSummary>>
getPercentageReport(tenantId: string, month: number, year: number, classId?: string): Observable<PaginatedResponse<AttendanceSummary>>

// Teacher
markAttendance(request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>>
updateTeacherAttendance(id: string, request: AttendanceRequest, tenantId: string): Observable<ApiResponse<AttendanceRecord>>
getClassAttendance(classId: string, date: string, tenantId: string): Observable<ApiResponse<AttendanceRecord[]>>
getStudentHistory(studentId: string, tenantId: string, fromDate?: string, toDate?: string, page?: number): Observable<PaginatedResponse<AttendanceRecord>>
getTodayAttendance(tenantId: string): Observable<ApiResponse<AttendanceRecord[]>>

// Parent
getChildAttendance(studentId: string, tenantId: string, fromDate?: string, toDate?: string, page?: number): Observable<PaginatedResponse<AttendanceRecord>>
getChildMonthlySummary(studentId: string, month: number, year: number, tenantId: string): Observable<ApiResponse<AttendanceSummary>>
getChildYearlySummary(studentId: string, year: number, tenantId: string): Observable<ApiResponse<YearlySummary>>
getChildCurrentSummary(studentId: string, tenantId: string): Observable<ApiResponse<AttendanceSummary>>
```

---

## Important Notes

1. Do NOT invent any API endpoints not listed above
2. `tenantId` is always a required query param — extract from existing auth state, not hardcoded
3. Page numbers are **1-based** (send `page=1` for first page)
4. `attendanceDate` must be sent as `YYYY-MM-DD` format
5. Teacher mark/edit: always validate on the UI that the date is today before enabling the save button
6. Parent endpoints: always pass the correct `studentId` from the selected child — the backend enforces ownership with HTTP 403
7. Delete is a **hard delete** — always confirm before calling
8. The `studentsBelow75Percent` list in the dashboard response only contains `studentId` and `attendancePercentage` — you may need to look up student names separately from the students API if you want to display names
9. Follow the existing HTTP interceptor for the Bearer token — do NOT add it manually in the service
10. There is NO student-facing attendance endpoint — do not build attendance UI for the STUDENT role