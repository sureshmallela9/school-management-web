# Fee Module Phase 1 — API Reference

> **Base URL:** `http://localhost:2020`  
> **Auth:** All endpoints require `Authorization: Bearer <JWT>` header  
> **Tenant:** All endpoints require `?tenantId=<tenantId>` query param  
> **Response wrapper:** Every response is wrapped in `ApiResponse<T>` or `PaginatedResponse<T>`

---

## Table of Contents

1. [Academic Year](#1-academic-year)
2. [Fee Category](#2-fee-category)
3. [Fee Term](#3-fee-term)
4. [Fee Structure](#4-fee-structure)
5. [Fee Assignment](#5-fee-assignment)
6. [Student Fee Ledger](#6-student-fee-ledger)
7. [Fee Receipt](#7-fee-receipt)
8. [Fee Dashboard](#8-fee-dashboard)
9. [Fee Reports](#9-fee-reports)
10. [Parent Fee View](#10-parent-fee-view)
11. [Teacher Fee View](#11-teacher-fee-view)
12. [Admin Fees (Migrated)](#12-admin-fees-endpoint-migrated)
13. [Error Responses](#13-error-responses)
14. [Fee Lifecycle Flow](#14-fee-lifecycle-flow)

---

## 1. Academic Year

### 1.1 Create Academic Year

**POST** `/api/admin/fee/academic-years?tenantId={tenantId}`  
**Role:** ADMIN

#### Request
```json
{
  "name": "2025-2026",
  "startDate": "2025-06-01",
  "endDate": "2026-05-31",
  "active": true
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Academic year created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "2025-2026",
    "startDate": "2025-06-01",
    "endDate": "2026-05-31",
    "active": true,
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T10:00:00",
    "updatedAt": "2026-07-27T10:00:00"
  },
  "error": null,
  "code": null
}
```

#### Error — Duplicate Name `409 Conflict`
```json
{
  "success": false,
  "message": "Academic year with name '2025-2026' already exists",
  "error": "CONFLICT",
  "code": 409
}
```

---

### 1.2 Update Academic Year

**PUT** `/api/admin/fee/academic-years/{id}?tenantId={tenantId}`  
**Role:** ADMIN

#### Request
```json
{
  "name": "2025-2026",
  "startDate": "2025-07-01",
  "endDate": "2026-06-30",
  "active": true
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Academic year updated successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "2025-2026",
    "startDate": "2025-07-01",
    "endDate": "2026-06-30",
    "active": true,
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T10:00:00",
    "updatedAt": "2026-07-27T11:30:00"
  }
}
```

---

### 1.3 Deactivate Academic Year

**PATCH** `/api/admin/fee/academic-years/{id}/deactivate?tenantId={tenantId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Academic year deactivated successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "2025-2026",
    "active": false,
    "tenantId": "tenant-001"
  }
}
```

---

### 1.4 List Academic Years

**GET** `/api/admin/fee/academic-years?tenantId={tenantId}&page=1&limit=10`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Academic years retrieved successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "2025-2026",
      "startDate": "2025-06-01",
      "endDate": "2026-05-31",
      "active": true,
      "tenantId": "tenant-001"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "2026-2027",
      "startDate": "2026-06-01",
      "endDate": "2027-05-31",
      "active": true,
      "tenantId": "tenant-001"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 2. Fee Category

### 2.1 Create Fee Category

**POST** `/api/admin/fee/categories?tenantId={tenantId}`  
**Role:** ADMIN

#### Request
```json
{
  "name": "Tuition",
  "description": "Monthly tuition fee for academic curriculum"
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Fee category created successfully",
  "data": {
    "id": "cat-001-uuid",
    "name": "Tuition",
    "description": "Monthly tuition fee for academic curriculum",
    "deleted": false,
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T10:00:00",
    "updatedAt": "2026-07-27T10:00:00"
  }
}
```

---

### 2.2 Update Fee Category

**PUT** `/api/admin/fee/categories/{id}?tenantId={tenantId}`  
**Role:** ADMIN

#### Request
```json
{
  "name": "Tuition Fee",
  "description": "Updated description for tuition"
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee category updated successfully",
  "data": {
    "id": "cat-001-uuid",
    "name": "Tuition Fee",
    "description": "Updated description for tuition",
    "deleted": false,
    "tenantId": "tenant-001"
  }
}
```

---

### 2.3 Soft Delete Fee Category

**DELETE** `/api/admin/fee/categories/{id}?tenantId={tenantId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee category deleted successfully",
  "data": null
}
```

---

### 2.4 List Fee Categories

**GET** `/api/admin/fee/categories?tenantId={tenantId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee categories retrieved successfully",
  "data": [
    { "id": "cat-001", "name": "Tuition", "description": "Tuition fee", "deleted": false },
    { "id": "cat-002", "name": "Library", "description": "Library usage fee", "deleted": false },
    { "id": "cat-003", "name": "Laboratory", "description": "Lab fee", "deleted": false },
    { "id": "cat-004", "name": "Sports", "description": "Sports activities", "deleted": false },
    { "id": "cat-005", "name": "Transport", "description": "School bus transport", "deleted": false }
  ]
}
```

> **Note:** Soft-deleted categories (deleted=true) are excluded from this list.

---

## 3. Fee Term

### 3.1 Create Fee Term

**POST** `/api/admin/fee/terms?tenantId={tenantId}`  
**Role:** ADMIN

#### Request — Annual
```json
{
  "academicYearId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "label": "Annual 2025-26",
  "frequency": "ANNUAL",
  "startDate": "2025-06-01",
  "endDate": "2026-05-31"
}
```

#### Request — Custom Term
```json
{
  "academicYearId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "label": "First Quarter",
  "frequency": "CUSTOM",
  "startDate": "2025-06-01",
  "endDate": "2025-08-31"
}
```

> **Frequency values:** `ANNUAL` | `SEMESTER` | `QUARTER` | `MONTHLY` | `CUSTOM`

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Fee term created successfully",
  "data": {
    "id": "term-001-uuid",
    "academicYearId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "label": "Annual 2025-26",
    "frequency": "ANNUAL",
    "startDate": "2025-06-01",
    "endDate": "2026-05-31",
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T10:00:00",
    "updatedAt": "2026-07-27T10:00:00"
  }
}
```

---

### 3.2 List Fee Terms by Academic Year

**GET** `/api/admin/fee/terms?academicYearId={academicYearId}&tenantId={tenantId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee terms retrieved successfully",
  "data": [
    {
      "id": "term-001-uuid",
      "academicYearId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "label": "Term 1",
      "frequency": "SEMESTER",
      "startDate": "2025-06-01",
      "endDate": "2025-11-30",
      "tenantId": "tenant-001"
    },
    {
      "id": "term-002-uuid",
      "academicYearId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "label": "Term 2",
      "frequency": "SEMESTER",
      "startDate": "2025-12-01",
      "endDate": "2026-05-31",
      "tenantId": "tenant-001"
    }
  ]
}
```

---

## 4. Fee Structure

### 4.1 Create Fee Structure

**POST** `/api/admin/fee/structures?tenantId={tenantId}`  
**Role:** ADMIN

> Defines: **how much** a student in **a specific class** owes for **a specific fee category** in **a specific term**.

#### Request
```json
{
  "academicYearId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "classId": "class-grade10-uuid",
  "feeCategoryId": "cat-001-uuid",
  "feeTermId": "term-001-uuid",
  "amount": 15000.00,
  "dueDate": "2025-07-15"
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Fee structure created successfully",
  "data": {
    "id": "struct-001-uuid",
    "academicYearId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "classId": "class-grade10-uuid",
    "feeCategoryId": "cat-001-uuid",
    "feeTermId": "term-001-uuid",
    "amount": 15000.00,
    "dueDate": "2025-07-15",
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T10:00:00",
    "updatedAt": "2026-07-27T10:00:00"
  }
}
```

#### Error — Duplicate Structure `409 Conflict`
```json
{
  "success": false,
  "message": "Fee structure already exists for this combination",
  "error": "CONFLICT",
  "code": 409
}
```

---

### 4.2 List Fee Structures (Filtered)

**GET** `/api/admin/fee/structures?tenantId={tenantId}&academicYearId={id}&classId={id}&page=1&limit=20`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee structures retrieved successfully",
  "data": [
    {
      "id": "struct-001-uuid",
      "academicYearId": "a1b2c3d4-...",
      "classId": "class-grade10-uuid",
      "feeCategoryId": "cat-001-uuid",
      "feeTermId": "term-001-uuid",
      "amount": 15000.00,
      "dueDate": "2025-07-15",
      "tenantId": "tenant-001"
    },
    {
      "id": "struct-002-uuid",
      "academicYearId": "a1b2c3d4-...",
      "classId": "class-grade10-uuid",
      "feeCategoryId": "cat-002-uuid",
      "feeTermId": "term-001-uuid",
      "amount": 500.00,
      "dueDate": "2025-07-15",
      "tenantId": "tenant-001"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 4.3 Delete Fee Structure

**DELETE** `/api/admin/fee/structures/{id}?tenantId={tenantId}`  
**Role:** ADMIN

#### Response `204 No Content`
```json
{
  "success": true,
  "message": "Fee structure deleted successfully",
  "data": null
}
```

#### Error — Has Ledger Entries `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Cannot delete: ledger entries exist for this structure",
  "error": "BUSINESS_RULE_VIOLATION",
  "code": 422
}
```

---

## 5. Fee Assignment

> Assigns a fee structure to a **class** (bulk) or **individual student**.  
> Student-level assignment overrides class-level amount.  
> Creates `StudentFeeLedger` entries automatically.

### 5.1 Assign Fee to Entire Class

**POST** `/api/admin/fee/assignments/class?tenantId={tenantId}`  
**Role:** ADMIN

#### Request
```json
{
  "feeStructureId": "struct-001-uuid",
  "classId": "class-grade10-uuid",
  "overrideAmount": null
}
```

> Set `overrideAmount` to a value to override the structure's default amount for all students in the class.

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Fee assigned to class successfully",
  "data": [
    {
      "id": "assign-s1-uuid",
      "feeStructureId": "struct-001-uuid",
      "assignmentType": "CLASS",
      "classId": "class-grade10-uuid",
      "studentId": "student-001-uuid",
      "overrideAmount": null,
      "tenantId": "tenant-001",
      "createdAt": "2026-07-27T10:00:00"
    },
    {
      "id": "assign-s2-uuid",
      "feeStructureId": "struct-001-uuid",
      "assignmentType": "CLASS",
      "classId": "class-grade10-uuid",
      "studentId": "student-002-uuid",
      "overrideAmount": null,
      "tenantId": "tenant-001",
      "createdAt": "2026-07-27T10:00:00"
    }
  ]
}
```

---

### 5.2 Assign Fee to Individual Student

**POST** `/api/admin/fee/assignments/student?tenantId={tenantId}`  
**Role:** ADMIN

#### Request — Student with discounted fee
```json
{
  "feeStructureId": "struct-001-uuid",
  "studentId": "student-003-uuid",
  "overrideAmount": 12000.00
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Fee assigned to student successfully",
  "data": {
    "id": "assign-s3-uuid",
    "feeStructureId": "struct-001-uuid",
    "assignmentType": "STUDENT",
    "classId": null,
    "studentId": "student-003-uuid",
    "overrideAmount": 12000.00,
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T10:00:00"
  }
}
```

---

### 5.3 Remove Fee Assignment

**DELETE** `/api/admin/fee/assignments/{id}?tenantId={tenantId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee assignment removed successfully",
  "data": null
}
```

#### Error — Has Receipts `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Cannot remove: receipts already recorded",
  "error": "BUSINESS_RULE_VIOLATION",
  "code": 422
}
```

---

### 5.4 List Assignments by Student or Class

**GET** `/api/admin/fee/assignments?tenantId={tenantId}&studentId={studentId}`  
**GET** `/api/admin/fee/assignments?tenantId={tenantId}&classId={classId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee assignments retrieved successfully",
  "data": [
    {
      "id": "assign-s1-uuid",
      "feeStructureId": "struct-001-uuid",
      "assignmentType": "CLASS",
      "classId": "class-grade10-uuid",
      "studentId": "student-001-uuid",
      "overrideAmount": null,
      "tenantId": "tenant-001"
    }
  ]
}
```

---

## 6. Student Fee Ledger

> The ledger is **automatically created** when a fee is assigned.  
> Admin can query it to see each student's fee obligations.

### 6.1 Get Ledger for a Student

**GET** `/api/admin/fee/ledger/{studentId}?tenantId={tenantId}&academicYearId={id}&status=PENDING&page=1&limit=20`  
**Role:** ADMIN

**Status values:** `PENDING` | `PARTIAL` | `PAID` (optional filter)

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Ledger entries retrieved successfully",
  "data": [
    {
      "id": "ledger-001-uuid",
      "studentId": "student-001-uuid",
      "feeAssignmentId": "assign-s1-uuid",
      "feeStructureId": "struct-001-uuid",
      "academicYearId": "a1b2c3d4-...",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 5000.00,
      "outstandingAmount": 10000.00,
      "dueDate": "2025-07-15",
      "status": "PARTIAL",
      "tenantId": "tenant-001",
      "createdAt": "2026-07-27T10:00:00",
      "updatedAt": "2026-07-27T12:00:00"
    },
    {
      "id": "ledger-002-uuid",
      "studentId": "student-001-uuid",
      "feeStructureId": "struct-002-uuid",
      "totalAmount": 500.00,
      "paidAmount": 0.00,
      "outstandingAmount": 500.00,
      "dueDate": "2025-07-15",
      "status": "PENDING",
      "tenantId": "tenant-001"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 6.2 List All Ledger Entries (Filtered)

**GET** `/api/admin/fee/ledger?tenantId={tenantId}&status=PENDING&classId={classId}&academicYearId={id}&page=1&limit=20`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Ledger entries retrieved successfully",
  "data": [
    {
      "id": "ledger-003-uuid",
      "studentId": "student-005-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 0.00,
      "outstandingAmount": 15000.00,
      "dueDate": "2025-07-15",
      "status": "PENDING",
      "classId": "class-grade10-uuid"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

## 7. Fee Receipt

> Receipts are **immutable** — once created they cannot be updated or deleted.  
> Generating a receipt automatically updates the ledger (`paidAmount`, `outstandingAmount`, `status`).

### 7.1 Generate Manual Receipt

**POST** `/api/admin/fee/receipts?tenantId={tenantId}`  
**Role:** ADMIN

#### Request
```json
{
  "ledgerEntryId": "ledger-001-uuid",
  "amountPaid": 5000.00,
  "receiptDate": "2026-07-27",
  "remarks": "Cash payment - first instalment"
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Receipt generated successfully",
  "data": {
    "id": "receipt-001-uuid",
    "receiptNumber": "REC-2026-000001",
    "ledgerEntryId": "ledger-001-uuid",
    "studentId": "student-001-uuid",
    "amountPaid": 5000.00,
    "receiptDate": "2026-07-27",
    "remarks": "Cash payment - first instalment",
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T14:30:00"
  }
}
```

> **After this call**, the ledger entry for `ledger-001-uuid` will show:
> - `paidAmount: 5000.00`
> - `outstandingAmount: 10000.00`
> - `status: "PARTIAL"`

#### Error — Overpayment `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Payment exceeds outstanding amount",
  "error": "BUSINESS_RULE_VIOLATION",
  "code": 422
}
```

---

### 7.2 Get Receipt by ID

**GET** `/api/admin/fee/receipts/{id}?tenantId={tenantId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Receipt retrieved successfully",
  "data": {
    "id": "receipt-001-uuid",
    "receiptNumber": "REC-2026-000001",
    "ledgerEntryId": "ledger-001-uuid",
    "studentId": "student-001-uuid",
    "amountPaid": 5000.00,
    "receiptDate": "2026-07-27",
    "remarks": "Cash payment - first instalment",
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T14:30:00"
  }
}
```

#### Error `404 Not Found`
```json
{
  "success": false,
  "message": "Receipt not found: receipt-999-uuid",
  "error": "RESOURCE_NOT_FOUND",
  "code": 404
}
```

---

### 7.3 List Receipts for a Student

**GET** `/api/admin/fee/receipts?studentId={studentId}&tenantId={tenantId}&page=1&limit=10`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Receipts retrieved successfully",
  "data": [
    {
      "id": "receipt-002-uuid",
      "receiptNumber": "REC-2026-000005",
      "ledgerEntryId": "ledger-001-uuid",
      "studentId": "student-001-uuid",
      "amountPaid": 10000.00,
      "receiptDate": "2026-07-20",
      "remarks": "Full payment",
      "tenantId": "tenant-001",
      "createdAt": "2026-07-20T09:15:00"
    },
    {
      "id": "receipt-001-uuid",
      "receiptNumber": "REC-2026-000001",
      "ledgerEntryId": "ledger-001-uuid",
      "studentId": "student-001-uuid",
      "amountPaid": 5000.00,
      "receiptDate": "2026-07-15",
      "remarks": "Cash payment - first instalment",
      "tenantId": "tenant-001",
      "createdAt": "2026-07-15T14:30:00"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 7.4 Immutability — PUT / PATCH / DELETE

**PUT / PATCH / DELETE** `/api/admin/fee/receipts/{id}`

#### Response `405 Method Not Allowed`
```json
{
  "success": false,
  "message": "Receipts are immutable and cannot be updated",
  "error": "METHOD_NOT_ALLOWED",
  "code": 405
}
```

---

## 8. Fee Dashboard

### 8.1 Get Fee Dashboard

**GET** `/api/admin/fee/dashboard?tenantId={tenantId}&academicYearId={id}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "totalAssigned": 1250000.00,
    "totalCollected": 875000.00,
    "totalOutstanding": 375000.00,
    "overdueCount": 23,
    "recentReceipts": [
      {
        "id": "receipt-010-uuid",
        "receiptNumber": "REC-2026-000010",
        "studentId": "student-015-uuid",
        "amountPaid": 15000.00,
        "receiptDate": "2026-07-27",
        "tenantId": "tenant-001"
      },
      {
        "id": "receipt-009-uuid",
        "receiptNumber": "REC-2026-000009",
        "studentId": "student-008-uuid",
        "amountPaid": 7500.00,
        "receiptDate": "2026-07-26",
        "tenantId": "tenant-001"
      }
    ],
    "monthlySummary": [
      { "month": "2025-08", "collectedAmount": 120000.00 },
      { "month": "2025-09", "collectedAmount": 95000.00 },
      { "month": "2025-10", "collectedAmount": 88000.00 },
      { "month": "2025-11", "collectedAmount": 102000.00 },
      { "month": "2025-12", "collectedAmount": 75000.00 },
      { "month": "2026-01", "collectedAmount": 110000.00 },
      { "month": "2026-02", "collectedAmount": 98000.00 },
      { "month": "2026-03", "collectedAmount": 85000.00 },
      { "month": "2026-04", "collectedAmount": 92000.00 },
      { "month": "2026-05", "collectedAmount": 45000.00 },
      { "month": "2026-06", "collectedAmount": 32000.00 },
      { "month": "2026-07", "collectedAmount": 33000.00 }
    ]
  }
}
```

> - **totalAssigned** = sum of all `StudentFeeLedger.totalAmount`
> - **totalCollected** = sum of all `StudentFeeLedger.paidAmount`
> - **totalOutstanding** = sum of all `StudentFeeLedger.outstandingAmount`
> - **overdueCount** = entries where `dueDate < today` AND `status != PAID`
> - **recentReceipts** = last 10 receipts by date
> - **monthlySummary** = last 12 months of collected amounts

---

## 9. Fee Reports

### 9.1 Student Fee Report

**GET** `/api/admin/fee/reports/student/{studentId}?tenantId={tenantId}&academicYearId={id}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Student fee report retrieved",
  "data": {
    "studentId": "student-001-uuid",
    "studentName": "Rahul Sharma",
    "totalAmount": 30500.00,
    "paidAmount": 15000.00,
    "outstandingAmount": 15500.00,
    "ledgerEntries": [
      {
        "id": "ledger-001-uuid",
        "feeCategoryId-context": "Tuition",
        "totalAmount": 15000.00,
        "paidAmount": 10000.00,
        "outstandingAmount": 5000.00,
        "dueDate": "2025-07-15",
        "status": "PARTIAL"
      },
      {
        "id": "ledger-002-uuid",
        "feeCategoryId-context": "Library",
        "totalAmount": 500.00,
        "paidAmount": 500.00,
        "outstandingAmount": 0.00,
        "dueDate": "2025-07-15",
        "status": "PAID"
      },
      {
        "id": "ledger-003-uuid",
        "feeCategoryId-context": "Transport",
        "totalAmount": 15000.00,
        "paidAmount": 4500.00,
        "outstandingAmount": 10500.00,
        "dueDate": "2025-07-15",
        "status": "PARTIAL"
      }
    ],
    "receipts": [
      {
        "receiptNumber": "REC-2026-000005",
        "amountPaid": 10000.00,
        "receiptDate": "2026-07-10",
        "remarks": "Term 1 tuition partial"
      },
      {
        "receiptNumber": "REC-2026-000003",
        "amountPaid": 500.00,
        "receiptDate": "2026-07-05",
        "remarks": "Library fee full payment"
      },
      {
        "receiptNumber": "REC-2026-000001",
        "amountPaid": 4500.00,
        "receiptDate": "2026-07-01",
        "remarks": "Transport advance"
      }
    ]
  }
}
```

---

### 9.2 Class Fee Report

**GET** `/api/admin/fee/reports/class/{classId}?tenantId={tenantId}&academicYearId={id}&page=1&limit=20`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Class fee report retrieved",
  "data": [
    {
      "studentId": "student-001-uuid",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 15000.00,
      "outstandingAmount": 0.00,
      "status": "PAID"
    },
    {
      "studentId": "student-002-uuid",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 5000.00,
      "outstandingAmount": 10000.00,
      "status": "PARTIAL"
    },
    {
      "studentId": "student-003-uuid",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 0.00,
      "outstandingAmount": 15000.00,
      "status": "PENDING"
    }
  ],
  "total": 35,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### 9.3 Outstanding Fees Report

**GET** `/api/admin/fee/reports/outstanding?tenantId={tenantId}&academicYearId={id}&classId={id}&page=1&limit=20`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Outstanding fees report retrieved",
  "data": [
    {
      "id": "ledger-005-uuid",
      "studentId": "student-002-uuid",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 5000.00,
      "outstandingAmount": 10000.00,
      "dueDate": "2025-07-15",
      "status": "PARTIAL"
    },
    {
      "id": "ledger-006-uuid",
      "studentId": "student-003-uuid",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 0.00,
      "outstandingAmount": 15000.00,
      "dueDate": "2025-07-15",
      "status": "PENDING"
    }
  ],
  "total": 18,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 9.4 Paid Fees Report

**GET** `/api/admin/fee/reports/paid?tenantId={tenantId}&academicYearId={id}&classId={id}&page=1&limit=20`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Paid fees report retrieved",
  "data": [
    {
      "id": "ledger-004-uuid",
      "studentId": "student-001-uuid",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 15000.00,
      "outstandingAmount": 0.00,
      "dueDate": "2025-07-15",
      "status": "PAID"
    }
  ],
  "total": 17,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 9.5 Overdue Fees Report

**GET** `/api/admin/fee/reports/overdue?tenantId={tenantId}&academicYearId={id}&classId={id}&page=1&limit=20`  
**Role:** ADMIN

> Returns all ledger entries where `dueDate < today` AND `status IN (PENDING, PARTIAL)`.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Overdue fees report retrieved",
  "data": [
    {
      "id": "ledger-007-uuid",
      "studentId": "student-010-uuid",
      "classId": "class-grade9-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 0.00,
      "outstandingAmount": 15000.00,
      "dueDate": "2025-07-01",
      "status": "PENDING"
    },
    {
      "id": "ledger-008-uuid",
      "studentId": "student-011-uuid",
      "classId": "class-grade9-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 3000.00,
      "outstandingAmount": 12000.00,
      "dueDate": "2025-07-01",
      "status": "PARTIAL"
    }
  ],
  "total": 23,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

## 10. Parent Fee View

> Parents can only see fee data for **their own children** (verified via `Student.parentId`).  
> Access to another parent's child returns `403 Forbidden`.

### 10.1 Parent: Get Fee Summary for Child

**GET** `/api/parent/fee/summary?tenantId={tenantId}&studentId={studentId}&academicYearId={id}&page=1&limit=20`  
**Role:** PARENT

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee summary retrieved",
  "data": [
    {
      "id": "ledger-001-uuid",
      "studentId": "student-001-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 10000.00,
      "outstandingAmount": 5000.00,
      "dueDate": "2025-07-15",
      "status": "PARTIAL",
      "academicYearId": "a1b2c3d4-..."
    },
    {
      "id": "ledger-002-uuid",
      "studentId": "student-001-uuid",
      "totalAmount": 500.00,
      "paidAmount": 500.00,
      "outstandingAmount": 0.00,
      "dueDate": "2025-07-15",
      "status": "PAID"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### Error — Student Not Owned by Parent `403 Forbidden`
```json
{
  "success": false,
  "message": "Access denied",
  "data": null
}
```

---

### 10.2 Parent: Get Receipt History for Child

**GET** `/api/parent/fee/receipts/{studentId}?tenantId={tenantId}&page=1&limit=10`  
**Role:** PARENT

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Receipts retrieved",
  "data": [
    {
      "id": "receipt-005-uuid",
      "receiptNumber": "REC-2026-000005",
      "studentId": "student-001-uuid",
      "amountPaid": 10000.00,
      "receiptDate": "2026-07-10",
      "remarks": "Tuition partial payment",
      "tenantId": "tenant-001",
      "createdAt": "2026-07-10T11:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 11. Teacher Fee View

> Teachers can only view fee data for **classes they teach** (verified via `SMS_TEACHER_CLASSES` join).  
> Read-only — no create, update, or delete endpoints available for teachers.

### 11.1 Teacher: Get Fee Summary for Class

**GET** `/api/teacher/fee/summary?tenantId={tenantId}&classId={classId}&academicYearId={id}&page=1&limit=20`  
**Role:** TEACHER

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee summary retrieved",
  "data": [
    {
      "id": "ledger-001-uuid",
      "studentId": "student-001-uuid",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 15000.00,
      "outstandingAmount": 0.00,
      "dueDate": "2025-07-15",
      "status": "PAID"
    },
    {
      "id": "ledger-003-uuid",
      "studentId": "student-002-uuid",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 0.00,
      "outstandingAmount": 15000.00,
      "dueDate": "2025-07-15",
      "status": "PENDING"
    }
  ],
  "total": 35,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

#### Error — Teacher Doesn't Teach This Class `403 Forbidden`
```json
{
  "success": false,
  "message": "Access denied",
  "data": null
}
```

---

## 12. Admin Fees Endpoint (Migrated)

> The existing `/api/admin/fees` endpoint has been migrated to return `StudentFeeLedger` data instead of the legacy `Fee` entity.

### 12.1 List All Fees (Ledger-Based)

**GET** `/api/admin/fees?tenantId={tenantId}&status=PENDING&page=1&limit=10`  
**Role:** ADMIN

**Status values:** `PENDING` | `PARTIAL` | `PAID` (optional)

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Fee records retrieved successfully",
  "data": [
    {
      "id": "ledger-001-uuid",
      "studentId": "student-001-uuid",
      "feeStructureId": "struct-001-uuid",
      "academicYearId": "a1b2c3d4-...",
      "classId": "class-grade10-uuid",
      "totalAmount": 15000.00,
      "paidAmount": 0.00,
      "outstandingAmount": 15000.00,
      "dueDate": "2025-07-15",
      "status": "PENDING",
      "tenantId": "tenant-001"
    }
  ],
  "total": 85,
  "page": 1,
  "limit": 10,
  "totalPages": 9
}
```

---

## 13. Error Responses

All errors follow the `ApiResponse` wrapper:

| HTTP Code | `error` field | When |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Invalid request body (e.g. missing required fields) |
| `404` | `RESOURCE_NOT_FOUND` | Entity not found (academic year, ledger, receipt, etc.) |
| `405` | `METHOD_NOT_ALLOWED` | PUT/PATCH/DELETE on a receipt |
| `409` | `CONFLICT` | Duplicate name or duplicate fee structure |
| `422` | `BUSINESS_RULE_VIOLATION` | Overpayment, delete blocked by references |
| `500` | Server error message | Unexpected exception |

#### Example — Validation Error `400`
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "name: Name is required; amount: Amount must be positive",
  "code": 400
}
```

#### Example — Not Found `404`
```json
{
  "success": false,
  "message": "Ledger entry not found: ledger-999-uuid",
  "error": "RESOURCE_NOT_FOUND",
  "code": 404
}
```

---

## 14. Fee Lifecycle Flow

```
STEP 1 — Setup (Admin)
══════════════════════
Create Academic Year  →  Create Fee Categories  →  Create Fee Terms
                                                          ↓
                                                  Create Fee Structure
                                         (academicYear + class + category + term + amount + dueDate)

STEP 2 — Assignment (Admin)
═══════════════════════════
Assign Fee Structure to Class   →  Creates StudentFeeLedger for EVERY student in class
  OR
Assign Fee Structure to Student →  Creates StudentFeeLedger for THAT student (overrides class amount)

STEP 3 — Ledger State
══════════════════════
StudentFeeLedger is created:
  totalAmount     = structure amount (or override)
  paidAmount      = 0
  outstandingAmount = totalAmount
  status          = PENDING

STEP 4 — Receipt Generation (Admin)
═════════════════════════════════════
POST /api/admin/fee/receipts  →  amountPaid submitted
                                        ↓
                               Ledger updated atomically:
                                 paidAmount += amountPaid
                                 outstandingAmount = total - paid
                                 status recalculated:
                                   paid=0       → PENDING
                                   0 < paid < total → PARTIAL
                                   paid = total → PAID
                                        ↓
                               Receipt saved (immutable, REC-YYYY-NNNNNN)

STEP 5 — Reporting
═══════════════════
Admin:   Dashboard  /  Student Report  /  Class Report  /  Outstanding  /  Paid  /  Overdue
Parent:  Fee Summary (own children only)  /  Receipt History
Teacher: Fee Summary (own classes only, read-only)
```

### Status Transition Rules

```
         Receipt generated
PENDING ─────────────────► PARTIAL  (0 < paidAmount < totalAmount)
PENDING ─────────────────► PAID     (paidAmount = totalAmount in single payment)
PARTIAL ─────────────────► PAID     (subsequent payment completes totalAmount)

OVERPAYMENT (paidAmount > totalAmount) → REJECTED with HTTP 422
```

---

*Run `sql/fee_module_phase1_ddl.sql` against Oracle DB before starting the application.*

