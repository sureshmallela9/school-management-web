# Angular Implementation Prompt — Student Module

## Context

You are working on an Angular project that connects to a Spring Boot REST API for a School Management System.

**Before writing any code**, read the existing Angular project thoroughly:
- Find how **Teacher**, **Admin**, and **Parent** modules are structured
- Identify the existing service patterns, component patterns, form patterns, routing patterns, API call patterns, table/pagination patterns, and notification/toast patterns
- Reuse those exact patterns for the Student module
- Do NOT introduce new libraries, new folder structures, or new coding patterns

---

## Backend Base URL

```
http://localhost:2020
```

All requests require:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

The `tenantId` must be sent as a **query parameter** on every request.

---

## Standard API Response Shapes

### Single Item Response (`ApiResponse<T>`)
```json
{
  "success": true,
  "data": { ... },
  "message": "Student retrieved successfully",
  "error": null,
  "code": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Student not found",
  "error": "Student with ID xyz not found for tenant T1",
  "code": 404
}
```

### Paginated Response (`PaginatedResponse<T>`)
```json
{
  "success": true,
  "data": [ ... ],
  "message": "Students retrieved successfully",
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```
> Note: `page` is **1-based** (first page = 1). Send `page=1` in requests.

---

## Student Model

### TypeScript Interface
```typescript
export interface Student {
  // Read-only (set by backend)
  id: string;              // UUID, auto-generated
  tenantId: string;        // Set by backend, do not send on create

  // Required fields (must be sent on create)
  name: string;            // NOT NULL
  rollNumber: string;      // NOT NULL
  classId: string;         // NOT NULL — ID of the class entity
  parentId: string;        // NOT NULL — ID of the parent user
  admissionNumber: string; // NOT NULL, UNIQUE

  // Optional fields
  className?: string;
  section?: string;
  parentName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;    // ISO date: "YYYY-MM-DD"
  gender?: string;         // e.g. "MALE", "FEMALE", "OTHER"
  bloodGroup?: string;     // e.g. "A+", "B-", "O+"
  address?: string;
}

// For create — omit id and tenantId, they are set by backend
export type CreateStudentRequest = Omit<Student, 'id' | 'tenantId'>;

// For update — all fields editable except id, tenantId, admissionNumber
export type UpdateStudentRequest = Omit<Student, 'id' | 'tenantId'>;
```

---

## Student APIs — Full Contract

### 1. Get All Students (Admin only)

```
GET /api/admin/students
Query params:
  tenantId    (required) — string
  page        (optional, default: 1) — number, 1-based
  limit       (optional, default: 10) — number
  searchTerm  (optional) — searches name and rollNumber (case-insensitive)

Response: PaginatedResponse<Student>
HTTP 200
```

### 2. Get Student by ID (Admin only)

```
GET /api/admin/students/{id}
Query params:
  tenantId  (required) — string

Response: ApiResponse<Student>
HTTP 200 — found
HTTP 404 — not found
```

### 3. Create Student (Admin only)

```
POST /api/admin/students
Body: CreateStudentRequest (raw Student entity — no id, no tenantId needed in body but include tenantId!)
Required fields: name, rollNumber, classId, parentId, admissionNumber, tenantId

Response: ApiResponse<Student>
HTTP 201 — created successfully

Error scenarios:
- admissionNumber already exists → HTTP 409 (IllegalArgumentException)
- Missing required fields → HTTP 400
```

### 4. Update Student (Admin only)

```
PUT /api/admin/students/{id}
Query params:
  tenantId  (required)
Body: UpdateStudentRequest

Editable fields: name, rollNumber, classId, className, section, parentId, parentName, phone, avatarUrl, dateOfBirth, gender, admissionNumber, bloodGroup, address

Response: ApiResponse<Student>
HTTP 200 — updated
HTTP 404 — student not found
```

### 5. Delete Student (Admin only)

```
DELETE /api/admin/students/{id}
Query params:
  tenantId  (required)

NOTE: This is a HARD DELETE — the student record is permanently removed.
Response: ApiResponse (no data)
HTTP 200 — deleted
HTTP 404 — not found
```

### 6. Get My Children (Parent only)

```
GET /api/parent/my-students
Query params:
  tenantId  (required)
  page      (optional, default: 1)
  limit     (optional, default: 10)

Note: parentId is resolved automatically from the JWT token.
The parent can only see their own children.
Response: PaginatedResponse<Student>
HTTP 200
```

---

## Role-Based UI Behaviour

### ADMIN role
- Can see the full **Student List** page with all students
- Can **search** students by name or roll number
- Can **create** a new student via a form/dialog
- Can **view** student details
- Can **edit** all student fields
- Can **delete** a student (with confirmation dialog — this is a permanent hard delete)
- Sees all students across the tenant, not filtered by parent or class

### PARENT role
- Can see **only their own children** (the API filters by the authenticated user's ID automatically)
- **Cannot create, edit, or delete** any student
- No search/filter controls needed — the list is always scoped to their children
- Typically shown on a "My Children" or "Dashboard" page

### TEACHER role
- No student CRUD endpoints exist for teachers in the backend
- Teachers may see students via attendance/homework (separate modules)
- Do NOT add student CRUD controls for the TEACHER role

### STUDENT role
- No student-facing student API endpoints exist
- Do NOT add any student CRUD or view for the STUDENT role

---

## Validation Rules (match these in the Angular form)

| Field | Rule |
|-------|------|
| `name` | Required |
| `rollNumber` | Required |
| `classId` | Required |
| `parentId` | Required |
| `admissionNumber` | Required, must be unique (backend enforces; show error on 409) |
| `dateOfBirth` | Optional, must be a valid past date |
| `gender` | Optional, allowed values: `MALE`, `FEMALE`, `OTHER` |
| `bloodGroup` | Optional, allowed values: `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-` |
| `phone` | Optional |

---

## Error Handling

Map backend HTTP codes to user-facing messages:

| Code | Scenario | User Message |
|------|----------|-------------|
| 400 | Validation failed | Show field-level error messages from `error` field |
| 404 | Student not found | "Student not found" toast/alert |
| 409 | Admission number already exists | Show inline error on admissionNumber field |
| 403 | Unauthorized | Redirect to login or show "Access denied" |
| 500 | Server error | "Something went wrong, please try again" |

---

## Implementation Requirements

Follow the existing Angular project's architecture. Inspect how Teacher, Admin, and Parent modules are built and match those exact patterns. Implement the following:

### 1. Student Model / Interface
- Create `Student` interface matching the TypeScript definition above
- Create `CreateStudentRequest` and `UpdateStudentRequest` types

### 2. Student Service
- Mirror the existing service pattern (e.g., how TeacherService or AdminService is structured)
- Methods to implement:
  - `getStudents(tenantId, page, limit, searchTerm?)` → `Observable<PaginatedResponse<Student>>`
  - `getStudentById(id, tenantId)` → `Observable<ApiResponse<Student>>`
  - `createStudent(student: CreateStudentRequest)` → `Observable<ApiResponse<Student>>`
  - `updateStudent(id, student: UpdateStudentRequest, tenantId)` → `Observable<ApiResponse<Student>>`
  - `deleteStudent(id, tenantId)` → `Observable<ApiResponse<any>>`
  - `getMyStudents(tenantId, page, limit)` → `Observable<PaginatedResponse<Student>>` (for parent role)

### 3. Student List Component (Admin)
- Paginated table of students
- Columns: Name, Roll Number, Class, Section, Parent Name, Admission Number, Actions
- Search bar filtering by name or roll number (calls API with `searchTerm`)
- "Add Student" button → opens Create form/dialog
- Edit icon → opens Edit form/dialog pre-filled with student data
- Delete icon → opens confirmation dialog (warn: permanent delete) → calls delete API
- Pagination controls (1-based page numbers, match backend)
- Follow existing table/list component pattern in the project

### 4. Student Detail/View Component (Admin)
- Shows all student fields in a read-only view
- Accessible from the list via row click or a "View" action button

### 5. Create Student Form (Admin)
- Form fields for all required + optional fields (see validation table above)
- Dropdowns for `gender` and `bloodGroup`
- `classId` — use existing classes dropdown if available in the project
- `parentId` — use existing parents dropdown if available
- On submit: call `createStudent`, show success toast, refresh list
- On 409: show "Admission number already in use" error on that field

### 6. Edit Student Form (Admin)
- Pre-filled with existing student data
- Same fields and validation as Create form
- `id` is NOT editable (read-only)
- On submit: call `updateStudent`, show success toast, close form

### 7. My Children Page (Parent role)
- Simple paginated list of the authenticated parent's children
- Columns: Name, Roll Number, Class, Section
- No search, no create/edit/delete buttons
- Use `getMyStudents()` service method
- Follow existing parent module page pattern

### 8. Routing
- Follow the existing route structure in the project
- Admin student routes: likely under `/admin/students`
- Parent children route: likely under `/parent/my-children` or `/parent/students`
- Guard routes using the existing role guard pattern

### 9. Role-based UI Guards
- Only show the student management menu item to ADMIN role
- Only show the "My Children" menu item to PARENT role
- Reuse the existing `AuthGuard` / role guard pattern already in the project

---

## Important Notes

1. Do NOT invent any API endpoints not listed above
2. The `tenantId` is always required as a query param — extract it from the stored auth state (JWT or local storage), following the existing pattern
3. Page numbers are 1-based in both request and response
4. Delete is a hard delete — always show a confirmation dialog before calling
5. The parent role's student list is automatically scoped by the JWT identity server-side — do not add client-side filtering
6. There is NO student-facing student endpoint — do not add a "my profile" student page unless the backend adds it
7. Follow the existing Angular project's HTTP interceptor for adding the Authorization header — do NOT add it manually in the service