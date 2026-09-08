# Angular Prompt — Fee Module UI (Admin / Parent / Teacher)

> Paste this whole file into your AI coding assistant (Copilot Chat, Cursor, etc.) inside your
> Angular workspace to scaffold the **Fee Module** feature. It is based on the actual current
> backend behaviour — including the fact that most fee endpoints return **raw IDs only**
> (no nested student/class/category names), except the 2 endpoints noted in section 3.

---

## 1. Context

- Backend: Spring Boot, base URL `http://localhost:2020`
- Every request needs `Authorization: Bearer <JWT>` and a `?tenantId=<tenantId>` query param
- Every response is wrapped in one of:
  ```ts
  interface ApiResponse<T> { success: boolean; message: string; data: T; error: string | null; code: number | null; }
  interface PaginatedResponse<T> extends ApiResponse<T[]> { total: number; page: number; limit: number; totalPages: number; }
  ```
- Pagination is **1-based** (`page=1` is the first page) for all fee endpoints.
- Roles: `ADMIN` (full CRUD), `TEACHER` (read-only, own classes), `PARENT` (read-only, own children).

---

## 2. ⚠️ Known backend limitation — IMPORTANT, read before generating code

Most fee list/report endpoints return **only foreign-key IDs**, not resolved names:

| Endpoint | Returns raw IDs for |
|---|---|
| `/api/admin/fee/ledger`, `/ledger/{studentId}` | `studentId`, `feeAssignmentId`, `feeStructureId`, `academicYearId`, `classId` |
| `/api/admin/fee/reports/outstanding`, `/paid`, `/overdue`, `/class/{classId}` | `studentId`, `classId` |
| `/api/admin/fee/assignments` | `feeStructureId`, `classId`, `studentId` |
| `/api/admin/fee/structures` | `academicYearId`, `classId`, `feeCategoryId`, `feeTermId` |
| `/api/admin/fee/receipts` | `studentId`, `ledgerEntryId` |
| `/api/parent/fee/summary`, `/api/teacher/fee/summary` | `studentId`, `classId` |
| `/api/admin/fees` (legacy, migrated) | `studentId`, `feeStructureId`, `academicYearId`, `classId` |

Only these 2 already give you a resolved name — use them directly, no lookup needed:
- `/api/admin/fee/reports/student/{studentId}` → `studentName` is present alongside `studentId`
- `/api/admin/teachers`, `/api/admin/students` (outside fee module) already return `className`, `section`, `parentName`

**Because of this, the Angular app MUST build a client-side name-resolution layer** (a
`FeeLookupService`) that pre-fetches and caches students, classes, academic years, fee
categories, fee terms and fee structures **once per tenant session**, then resolves IDs → names
in the UI via pipes/pure functions — WITHOUT making a network call per row (no N+1 on the
frontend either).

---

## 3. TypeScript Models

```typescript
// models/api-response.model.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
  code: number | null;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// models/fee.model.ts
export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID';
export type FeeTermFrequency = 'ANNUAL' | 'SEMESTER' | 'QUARTER' | 'MONTHLY' | 'CUSTOM';
export type AssignmentType = 'CLASS' | 'STUDENT';

export interface AcademicYear {
  id: string; name: string; startDate: string; endDate: string;
  active: boolean; tenantId: string; createdAt?: string; updatedAt?: string;
}

export interface FeeCategory {
  id: string; name: string; description: string; deleted: boolean;
  tenantId?: string; createdAt?: string; updatedAt?: string;
}

export interface FeeTerm {
  id: string; academicYearId: string; label: string; frequency: FeeTermFrequency;
  startDate: string; endDate: string; tenantId?: string;
}

export interface FeeStructure {
  id: string; academicYearId: string; classId: string; feeCategoryId: string;
  feeTermId: string; amount: number; dueDate: string; tenantId?: string;
}

export interface FeeAssignment {
  id: string; feeStructureId: string; assignmentType: AssignmentType;
  classId: string | null; studentId: string | null; overrideAmount: number | null;
  tenantId?: string; createdAt?: string;
}

// Raw shape as returned by the backend (IDs only)
export interface StudentFeeLedger {
  id: string;
  studentId: string;
  feeAssignmentId?: string;
  feeStructureId?: string;
  academicYearId?: string;
  classId: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  status: FeeStatus;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Enriched shape used ONLY in the Angular view layer (never sent by backend)
export interface StudentFeeLedgerView extends StudentFeeLedger {
  studentName?: string;
  admissionNumber?: string;
  className?: string;      // resolved via classId lookup
  academicYearName?: string;
  feeCategoryName?: string; // via feeStructureId -> feeCategoryId lookup
  feeTermLabel?: string;
}

export interface FeeReceipt {
  id: string; receiptNumber: string; ledgerEntryId: string; studentId: string;
  amountPaid: number; receiptDate: string; remarks: string;
  tenantId?: string; createdAt?: string;
}

export interface FeeReceiptView extends FeeReceipt {
  studentName?: string;
}

export interface FeeDashboard {
  totalAssigned: number; totalCollected: number; totalOutstanding: number;
  overdueCount: number; recentReceipts: FeeReceipt[];
  monthlySummary: { month: string; collectedAmount: number }[];
}

// This one is ALREADY enriched by backend — use studentName directly
export interface StudentFeeReport {
  studentId: string;
  studentName: string;
  totalAmount: number; paidAmount: number; outstandingAmount: number;
  ledgerEntries: StudentFeeLedger[];
  receipts: FeeReceipt[];
}
```

---

## 4. Services to generate

### 4.1 `FeeLookupService` (core/services) — solves the ID-only problem

```typescript
@Injectable({ providedIn: 'root' })
export class FeeLookupService {
  private students = new Map<string, { name: string; admissionNumber: string; className: string }>();
  private classes = new Map<string, { name: string; section: string }>();
  private academicYears = new Map<string, string>(); // id -> name
  private feeCategories = new Map<string, string>();  // id -> name
  private feeTerms = new Map<string, string>();        // id -> label
  private feeStructures = new Map<string, FeeStructure>(); // id -> structure (to get categoryId/termId)
  private loaded = false;

  constructor(private http: HttpClient) {}

  /** Call once after login / tenant switch, before rendering any fee list */
  loadAll(tenantId: string): Observable<void> {
    if (this.loaded) return of(void 0);
    return forkJoin({
      students: this.http.get<PaginatedResponse<any>>(`/api/admin/students?tenantId=${tenantId}&page=1&limit=1000`),
      classes: this.http.get<ApiResponse<any[]>>(`/api/admin/classes?tenantId=${tenantId}`), // adjust to actual class endpoint
      years: this.http.get<PaginatedResponse<AcademicYear>>(`/api/admin/fee/academic-years?tenantId=${tenantId}&page=1&limit=100`),
      categories: this.http.get<ApiResponse<FeeCategory[]>>(`/api/admin/fee/categories?tenantId=${tenantId}`),
      structures: this.http.get<PaginatedResponse<FeeStructure>>(`/api/admin/fee/structures?tenantId=${tenantId}&page=1&limit=1000`),
    }).pipe(
      map(({ students, classes, years, categories, structures }) => {
        students.data.forEach(s => this.students.set(s.id, { name: s.name, admissionNumber: s.admissionNumber, className: `${s.className ?? ''} ${s.section ?? ''}`.trim() }));
        (classes.data ?? []).forEach((c: any) => this.classes.set(c.id, { name: c.name, section: c.section }));
        years.data.forEach(y => this.academicYears.set(y.id, y.name));
        categories.data.forEach(c => this.feeCategories.set(c.id, c.name));
        structures.data.forEach(st => this.feeStructures.set(st.id, st));
        this.loaded = true;
      })
    );
  }

  studentName(id?: string) { return id ? this.students.get(id)?.name ?? id : ''; }
  className(id?: string) {
    const c = id ? this.classes.get(id) : undefined;
    return c ? `${c.name} ${c.section}` : (id ?? '');
  }
  academicYearName(id?: string) { return id ? this.academicYears.get(id) ?? id : ''; }
  feeCategoryName(structureId?: string) {
    const s = structureId ? this.feeStructures.get(structureId) : undefined;
    return s ? this.feeCategories.get(s.feeCategoryId) ?? s.feeCategoryId : '';
  }

  /** Enrich a raw ledger row for display without extra HTTP calls */
  enrichLedger(row: StudentFeeLedger): StudentFeeLedgerView {
    return {
      ...row,
      studentName: this.studentName(row.studentId),
      className: this.className(row.classId),
      academicYearName: this.academicYearName(row.academicYearId),
      feeCategoryName: this.feeCategoryName(row.feeStructureId),
    };
  }

  enrichReceipt(row: FeeReceipt): FeeReceiptView {
    return { ...row, studentName: this.studentName(row.studentId) };
  }
}
```

> Adjust the `/api/admin/classes` URL to whatever your actual class-list endpoint is — check
> `ClassEntity`/`ClassEntityDto` controller before wiring this in.

### 4.2 Feature services (one per controller area)

```typescript
@Injectable({ providedIn: 'root' })
export class AcademicYearService {
  private base = '/api/admin/fee/academic-years';
  constructor(private http: HttpClient) {}
  list(tenantId: string, page = 1, limit = 10) {
    return this.http.get<PaginatedResponse<AcademicYear>>(`${this.base}?tenantId=${tenantId}&page=${page}&limit=${limit}`);
  }
  create(tenantId: string, body: Partial<AcademicYear>) {
    return this.http.post<ApiResponse<AcademicYear>>(`${this.base}?tenantId=${tenantId}`, body);
  }
  update(id: string, tenantId: string, body: Partial<AcademicYear>) {
    return this.http.put<ApiResponse<AcademicYear>>(`${this.base}/${id}?tenantId=${tenantId}`, body);
  }
  deactivate(id: string, tenantId: string) {
    return this.http.patch<ApiResponse<AcademicYear>>(`${this.base}/${id}/deactivate?tenantId=${tenantId}`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class FeeCategoryService {
  private base = '/api/admin/fee/categories';
  constructor(private http: HttpClient) {}
  list(tenantId: string) { return this.http.get<ApiResponse<FeeCategory[]>>(`${this.base}?tenantId=${tenantId}`); }
  create(tenantId: string, body: { name: string; description: string }) {
    return this.http.post<ApiResponse<FeeCategory>>(`${this.base}?tenantId=${tenantId}`, body);
  }
  update(id: string, tenantId: string, body: { name: string; description: string }) {
    return this.http.put<ApiResponse<FeeCategory>>(`${this.base}/${id}?tenantId=${tenantId}`, body);
  }
  delete(id: string, tenantId: string) {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}?tenantId=${tenantId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class FeeTermService {
  private base = '/api/admin/fee/terms';
  constructor(private http: HttpClient) {}
  listByYear(academicYearId: string, tenantId: string) {
    return this.http.get<ApiResponse<FeeTerm[]>>(`${this.base}?academicYearId=${academicYearId}&tenantId=${tenantId}`);
  }
  create(tenantId: string, body: Omit<FeeTerm, 'id' | 'tenantId'>) {
    return this.http.post<ApiResponse<FeeTerm>>(`${this.base}?tenantId=${tenantId}`, body);
  }
}

@Injectable({ providedIn: 'root' })
export class FeeStructureService {
  private base = '/api/admin/fee/structures';
  constructor(private http: HttpClient) {}
  list(tenantId: string, academicYearId?: string, classId?: string, page = 1, limit = 20) {
    let params = `tenantId=${tenantId}&page=${page}&limit=${limit}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    if (classId) params += `&classId=${classId}`;
    return this.http.get<PaginatedResponse<FeeStructure>>(`${this.base}?${params}`);
  }
  create(tenantId: string, body: Omit<FeeStructure, 'id' | 'tenantId'>) {
    return this.http.post<ApiResponse<FeeStructure>>(`${this.base}?tenantId=${tenantId}`, body);
  }
  delete(id: string, tenantId: string) {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}?tenantId=${tenantId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class FeeAssignmentService {
  private base = '/api/admin/fee/assignments';
  constructor(private http: HttpClient) {}
  assignToClass(tenantId: string, body: { feeStructureId: string; classId: string; overrideAmount: number | null }) {
    return this.http.post<ApiResponse<FeeAssignment[]>>(`${this.base}/class?tenantId=${tenantId}`, body);
  }
  assignToStudent(tenantId: string, body: { feeStructureId: string; studentId: string; overrideAmount: number | null }) {
    return this.http.post<ApiResponse<FeeAssignment>>(`${this.base}/student?tenantId=${tenantId}`, body);
  }
  remove(id: string, tenantId: string) {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}?tenantId=${tenantId}`);
  }
  listByStudent(studentId: string, tenantId: string) {
    return this.http.get<ApiResponse<FeeAssignment[]>>(`${this.base}?tenantId=${tenantId}&studentId=${studentId}`);
  }
  listByClass(classId: string, tenantId: string) {
    return this.http.get<ApiResponse<FeeAssignment[]>>(`${this.base}?tenantId=${tenantId}&classId=${classId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class StudentFeeLedgerService {
  private base = '/api/admin/fee/ledger';
  constructor(private http: HttpClient) {}
  byStudent(studentId: string, tenantId: string, academicYearId?: string, status?: FeeStatus, page = 1, limit = 20) {
    let params = `tenantId=${tenantId}&page=${page}&limit=${limit}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    if (status) params += `&status=${status}`;
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.base}/${studentId}?${params}`);
  }
  list(tenantId: string, status?: FeeStatus, classId?: string, academicYearId?: string, page = 1, limit = 20) {
    let params = `tenantId=${tenantId}&page=${page}&limit=${limit}`;
    if (status) params += `&status=${status}`;
    if (classId) params += `&classId=${classId}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.base}?${params}`);
  }
}

@Injectable({ providedIn: 'root' })
export class FeeReceiptService {
  private base = '/api/admin/fee/receipts';
  constructor(private http: HttpClient) {}
  generate(tenantId: string, body: { ledgerEntryId: string; amountPaid: number; receiptDate: string; remarks: string }) {
    return this.http.post<ApiResponse<FeeReceipt>>(`${this.base}?tenantId=${tenantId}`, body);
  }
  getById(id: string, tenantId: string) {
    return this.http.get<ApiResponse<FeeReceipt>>(`${this.base}/${id}?tenantId=${tenantId}`);
  }
  listByStudent(studentId: string, tenantId: string, page = 1, limit = 10) {
    return this.http.get<PaginatedResponse<FeeReceipt>>(`${this.base}?studentId=${studentId}&tenantId=${tenantId}&page=${page}&limit=${limit}`);
  }
}

@Injectable({ providedIn: 'root' })
export class FeeDashboardService {
  constructor(private http: HttpClient) {}
  get(tenantId: string, academicYearId?: string) {
    let params = `tenantId=${tenantId}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    return this.http.get<ApiResponse<FeeDashboard>>(`/api/admin/fee/dashboard?${params}`);
  }
}

@Injectable({ providedIn: 'root' })
export class FeeReportService {
  private base = '/api/admin/fee/reports';
  constructor(private http: HttpClient) {}
  studentReport(studentId: string, tenantId: string, academicYearId?: string) {
    let params = `tenantId=${tenantId}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    // Already enriched with studentName — use directly, no lookup needed
    return this.http.get<ApiResponse<StudentFeeReport>>(`${this.base}/student/${studentId}?${params}`);
  }
  classReport(classId: string, tenantId: string, academicYearId?: string, page = 1, limit = 20) {
    let params = `tenantId=${tenantId}&page=${page}&limit=${limit}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.base}/class/${classId}?${params}`);
  }
  outstanding(tenantId: string, academicYearId?: string, classId?: string, page = 1, limit = 20) {
    return this.byBucket('outstanding', tenantId, academicYearId, classId, page, limit);
  }
  paid(tenantId: string, academicYearId?: string, classId?: string, page = 1, limit = 20) {
    return this.byBucket('paid', tenantId, academicYearId, classId, page, limit);
  }
  overdue(tenantId: string, academicYearId?: string, classId?: string, page = 1, limit = 20) {
    return this.byBucket('overdue', tenantId, academicYearId, classId, page, limit);
  }
  private byBucket(bucket: string, tenantId: string, academicYearId?: string, classId?: string, page = 1, limit = 20) {
    let params = `tenantId=${tenantId}&page=${page}&limit=${limit}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    if (classId) params += `&classId=${classId}`;
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.base}/${bucket}?${params}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ParentFeeService {
  constructor(private http: HttpClient) {}
  summary(studentId: string, tenantId: string, academicYearId?: string, page = 1, limit = 20) {
    let params = `tenantId=${tenantId}&studentId=${studentId}&page=${page}&limit=${limit}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`/api/parent/fee/summary?${params}`);
  }
  receipts(studentId: string, tenantId: string, page = 1, limit = 10) {
    return this.http.get<PaginatedResponse<FeeReceipt>>(`/api/parent/fee/receipts/${studentId}?tenantId=${tenantId}&page=${page}&limit=${limit}`);
  }
}

@Injectable({ providedIn: 'root' })
export class TeacherFeeService {
  constructor(private http: HttpClient) {}
  summary(classId: string, tenantId: string, academicYearId?: string, page = 1, limit = 20) {
    let params = `tenantId=${tenantId}&classId=${classId}&page=${page}&limit=${limit}`;
    if (academicYearId) params += `&academicYearId=${academicYearId}`;
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`/api/teacher/fee/summary?${params}`);
  }
}
```

---

## 5. Component wiring pattern (apply this to every list screen)

```typescript
@Component({ selector: 'app-fee-ledger-list', /* ... */ })
export class FeeLedgerListComponent implements OnInit {
  rows: StudentFeeLedgerView[] = [];
  loading = true;

  constructor(
    private lookup: FeeLookupService,
    private ledgerService: StudentFeeLedgerService,
    private tenant: TenantService, // existing app service holding current tenantId
  ) {}

  ngOnInit() {
    const tenantId = this.tenant.currentTenantId;
    // 1) Ensure lookup caches are warm (no-op if already loaded this session)
    this.lookup.loadAll(tenantId).subscribe(() => {
      // 2) Fetch raw ledger page
      this.ledgerService.list(tenantId, 'PENDING', undefined, undefined, 1, 20)
        .subscribe(res => {
          // 3) Enrich client-side — zero extra HTTP calls per row
          this.rows = res.data.map(r => this.lookup.enrichLedger(r));
          this.loading = false;
        });
    });
  }
}
```

```html
<!-- fee-ledger-list.component.html -->
<table mat-table [dataSource]="rows">
  <ng-container matColumnDef="student">
    <th mat-header-cell *matHeaderCellDef>Student</th>
    <td mat-cell *matCellDef="let row">{{ row.studentName }}</td>
  </ng-container>
  <ng-container matColumnDef="class">
    <th mat-header-cell *matHeaderCellDef>Class</th>
    <td mat-cell *matCellDef="let row">{{ row.className }}</td>
  </ng-container>
  <ng-container matColumnDef="category">
    <th mat-header-cell *matHeaderCellDef>Fee Category</th>
    <td mat-cell *matCellDef="let row">{{ row.feeCategoryName }}</td>
  </ng-container>
  <ng-container matColumnDef="status">
    <th mat-header-cell *matHeaderCellDef>Status</th>
    <td mat-cell *matCellDef="let row">
      <span class="badge" [ngClass]="row.status.toLowerCase()">{{ row.status }}</span>
    </td>
  </ng-container>
  <!-- amount columns, due date, actions... -->
</table>
```

Use the same `lookup.enrichLedger()` / `lookup.enrichReceipt()` pattern for:
- Outstanding / Paid / Overdue report tables
- Class Fee Report table
- Fee Assignment list (resolve `feeStructureId` → category/term/amount via `feeStructures` map)
- Fee Structure list (resolve `academicYearId`, `classId`, `feeCategoryId`, `feeTermId`)
- Fee Receipt list (resolve `studentId` → name)
- Parent/Teacher fee summary tables

For the **Student Fee Report** screen (`/reports/student/{id}`), skip the lookup entirely — the
backend already returns `studentName`, so bind it directly.

---

## 6. Screens to generate (Admin)

1. **Academic Years** — table + create/edit dialog + deactivate action
2. **Fee Categories** — table + create/edit dialog + soft-delete confirm
3. **Fee Terms** — nested under an Academic Year detail view; create dialog (frequency dropdown)
4. **Fee Structures** — filterable table (year/class); create dialog referencing category+term dropdowns (populated from lookup service)
5. **Fee Assignments** — two tabs: "Assign to Class" (bulk) / "Assign to Student" (with override amount); list view resolves names via lookup
6. **Student Fee Ledger** — per-student ledger view + global filtered ledger table
7. **Fee Receipts** — generate-receipt form (select ledger entry → shows outstanding amount as max) + read-only receipt list/print view (immutable, no edit/delete buttons)
8. **Fee Dashboard** — KPI cards (assigned/collected/outstanding/overdue) + Chart.js line chart for `monthlySummary` + recent receipts table
9. **Fee Reports** — tabs: Student / Class / Outstanding / Paid / Overdue, each reusing the enrichment pattern above

## 7. Screens to generate (Parent / Teacher)

10. **Parent Fee Summary** — per-child ledger list (own children only, resolved via lookup for category/class labels) + receipt history tab
11. **Teacher Fee Summary** — read-only ledger table for teacher's own classes (no create/edit actions anywhere)

---

## 8. Validation rules to enforce client-side (mirrors backend business rules)

- Academic year `startDate < endDate`; unique `name` per tenant (surface 409 as inline error)
- Fee structure: `amount > 0`; duplicate (year+class+category+term) → surface 409
- Fee assignment: `overrideAmount` optional, must be `> 0` if provided
- Fee receipt: `amountPaid > 0`; disable submit if `amountPaid > outstandingAmount` (mirrors 422 overpayment rule); receipt form has **no edit/delete** entry points anywhere in the UI (backend returns 405)
- All list screens: page starts at 1, not 0

## 9. Error handling

Map `ApiResponse.error` codes to toasts:
- `VALIDATION_ERROR` (400) → red toast with backend message
- `RESOURCE_NOT_FOUND` (404) → inline "not found" state
- `CONFLICT` (409) → red toast, keep form open for correction
- `BUSINESS_RULE_VIOLATION` (422) → red toast (overpayment / delete blocked)
- `403` (parent/teacher ownership) → redirect to "Access Denied" page, do not leak data

---

## 10. Acceptance checklist

- [ ] `FeeLookupService` loads once per tenant session and caches students/classes/years/categories/structures
- [ ] Every fee list/report table shows **names**, not raw UUIDs, without per-row HTTP calls
- [ ] Student Fee Report screen binds `studentName` directly from the API (no lookup call)
- [ ] Receipt screens have zero edit/delete UI (immutable)
- [ ] Parent/Teacher views only ever call their own-scoped endpoints, no admin endpoints
- [ ] All amounts formatted with `currency: 'INR'` pipe
- [ ] Pagination controls use 1-based `page`

