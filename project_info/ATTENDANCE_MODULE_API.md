# Attendance Module Phase 1 — API Reference

> **Base URL:** `http://localhost:2020`  
> **Auth:** All endpoints require `Authorization: Bearer <JWT>` header  
> **Tenant:** All endpoints require `?tenantId=<tenantId>` query param  
> **API Version:** All new attendance endpoints use `/api/v1/` prefix  
> **Response wrapper:** Every response is wrapped in `ApiResponse<T>` or `PaginatedResponse<T>`

---

## Table of Contents

1. [Admin — Mark & Manage Attendance](#1-admin--mark--manage-attendance)
2. [Admin — Attendance Dashboard](#2-admin--attendance-dashboard)
3. [Admin — Attendance Reports](#3-admin--attendance-reports)
4. [Admin — Attendance Summary Recalculate](#4-admin--attendance-summary-recalculate)
5. [Admin — Audit Trail](#5-admin--audit-trail)
6. [Teacher — Mark Attendance](#6-teacher--mark-attendance)
7. [Teacher — View Attendance](#7-teacher--view-attendance)
8. [Parent — View Child Attendance](#8-parent--view-child-attendance)
9. [Error Responses](#9-error-responses)
10. [Attendance Lifecycle Flow](#10-attendance-lifecycle-flow)

---

## 1. Admin — Mark & Manage Attendance

> Admin can create, update, delete, and list attendance records for **any student on any past or present date**.

### 1.1 Create Attendance Record

**POST** `/api/v1/admin/attendance?tenantId={tenantId}`  
**Role:** ADMIN

#### Request
```json
{
  "studentId": "student-001-uuid",
  "teacherId": "teacher-001-uuid",
  "classId": "class-grade10a-uuid",
  "sectionId": "class-grade10a-uuid",
  "academicYearId": "acyr-001-uuid",
  "attendanceDate": "2026-07-27",
  "attendanceType": "PRESENT",
  "remarks": "Marked by admin"
}
```

> **attendanceType values:** `PRESENT` | `ABSENT` | `LATE` | `HALF_DAY` | `LEAVE` | `HOLIDAY` | `MEDICAL_LEAVE`  
> **Note:** `sectionId` = the `id` of the `ClassEntity` row (class and section are stored together in `SMS_CLASSES`).

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Attendance record created successfully",
  "data": {
    "id": "att-001-uuid",
    "studentId": "student-001-uuid",
    "teacherId": "teacher-001-uuid",
    "classId": "class-grade10a-uuid",
    "sectionId": "class-grade10a-uuid",
    "academicYearId": "acyr-001-uuid",
    "attendanceDate": "2026-07-27",
    "attendanceType": "PRESENT",
    "remarks": "Marked by admin",
    "markedBy": "admin@school.com",
    "markedAt": "2026-07-27T09:00:00",
    "status": "ACTIVE",
    "version": 0,
    "tenantId": "tenant-001",
    "createdAt": "2026-07-27T09:00:00",
    "updatedAt": "2026-07-27T09:00:00"
  },
  "error": null,
  "code": null
}
```

#### Error — Duplicate Attendance `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Attendance already marked for this student on this date",
  "error": "DUPLICATE_ATTENDANCE",
  "code": 422
}
```

#### Error — Future Date `400 Bad Request`
```json
{
  "success": false,
  "message": "Attendance date cannot be in the future",
  "error": "VALIDATION_ERROR",
  "code": 400
}
```

---

### 1.2 Update Attendance Record

**PUT** `/api/v1/admin/attendance/{id}?tenantId={tenantId}`  
**Role:** ADMIN

> Admin can update **any** record regardless of date (past or present).

#### Request
```json
{
  "attendanceType": "ABSENT",
  "remarks": "Student was absent — correction by admin"
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance record updated successfully",
  "data": {
    "id": "att-001-uuid",
    "studentId": "student-001-uuid",
    "attendanceDate": "2026-07-27",
    "attendanceType": "ABSENT",
    "remarks": "Student was absent — correction by admin",
    "markedBy": "admin@school.com",
    "version": 1,
    "tenantId": "tenant-001",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

#### Error `404 Not Found`
```json
{
  "success": false,
  "message": "Attendance record not found: att-999-uuid",
  "error": "RESOURCE_NOT_FOUND",
  "code": 404
}
```

---

### 1.3 Delete Attendance Record

**DELETE** `/api/v1/admin/attendance/{id}?tenantId={tenantId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance record deleted successfully",
  "data": null
}
```

#### Error `404 Not Found`
```json
{
  "success": false,
  "message": "Attendance record not found: att-999-uuid",
  "error": "RESOURCE_NOT_FOUND",
  "code": 404
}
```

---

### 1.4 Get Attendance by ID

**GET** `/api/v1/admin/attendance/{id}?tenantId={tenantId}`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance record retrieved successfully",
  "data": {
    "id": "att-001-uuid",
    "studentId": "student-001-uuid",
    "teacherId": "teacher-001-uuid",
    "classId": "class-grade10a-uuid",
    "sectionId": "class-grade10a-uuid",
    "academicYearId": "acyr-001-uuid",
    "attendanceDate": "2026-07-27",
    "attendanceType": "PRESENT",
    "remarks": "Present",
    "markedBy": "teacher@school.com",
    "markedAt": "2026-07-27T08:45:00",
    "tenantId": "tenant-001"
  }
}
```

---

### 1.5 List & Filter Attendance

**GET** `/api/v1/admin/attendance?tenantId={tenantId}&classId={id}&studentId={id}&attendanceDate={date}&attendanceType=ABSENT&page=1&limit=20`  
**Role:** ADMIN

> All query params (except `tenantId`) are optional filters.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": [
    {
      "id": "att-001-uuid",
      "studentId": "student-001-uuid",
      "classId": "class-grade10a-uuid",
      "attendanceDate": "2026-07-27",
      "attendanceType": "PRESENT",
      "markedBy": "teacher@school.com",
      "tenantId": "tenant-001"
    },
    {
      "id": "att-002-uuid",
      "studentId": "student-002-uuid",
      "classId": "class-grade10a-uuid",
      "attendanceDate": "2026-07-27",
      "attendanceType": "ABSENT",
      "markedBy": "teacher@school.com",
      "tenantId": "tenant-001"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

## 2. Admin — Attendance Dashboard

### 2.1 Get Attendance Dashboard

**GET** `/api/v1/admin/attendance/dashboard?tenantId={tenantId}&academicYearId={id}`  
**Role:** ADMIN

> Returns **live** counts from today's attendance records (not cached).

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance dashboard retrieved successfully",
  "data": {
    "todayDate": "2026-07-28",
    "totalStudents": 450,
    "presentCount": 390,
    "absentCount": 35,
    "lateCount": 12,
    "leaveCount": 8,
    "holidayCount": 0,
    "halfDayCount": 5,
    "attendancePercentageToday": 86.67,
    "studentsBelow75Percent": [
      {
        "studentId": "student-010-uuid",
        "studentName": "Arjun Reddy",
        "classId": "class-grade9b-uuid",
        "attendancePercentage": 62.5
      },
      {
        "studentId": "student-025-uuid",
        "studentName": "Meera Patel",
        "classId": "class-grade8a-uuid",
        "attendancePercentage": 70.0
      }
    ],
    "classSummary": [
      {
        "classId": "class-grade10a-uuid",
        "className": "Grade 10 - A",
        "present": 38,
        "absent": 2,
        "total": 40
      },
      {
        "classId": "class-grade9b-uuid",
        "className": "Grade 9 - B",
        "present": 34,
        "absent": 6,
        "total": 40
      }
    ]
  }
}
```

> - **attendancePercentageToday** = (presentCount + halfDayCount × 0.5) / totalStudents × 100  
> - **studentsBelow75Percent** = students whose current-month `attendancePercentage` < 75.0  
> - Dashboard counts are real-time — each call re-reads live attendance records

---

## 3. Admin — Attendance Reports

### 3.1 Daily Attendance Report

**GET** `/api/v1/admin/attendance/report/daily?tenantId={tenantId}&attendanceDate={date}&classId={id}&page=1&limit=40`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Daily attendance report retrieved",
  "data": {
    "attendanceDate": "2026-07-27",
    "classId": "class-grade10a-uuid",
    "summary": {
      "present": 36,
      "absent": 3,
      "late": 1,
      "leave": 0,
      "holiday": 0,
      "total": 40
    },
    "records": [
      {
        "id": "att-001-uuid",
        "studentId": "student-001-uuid",
        "attendanceDate": "2026-07-27",
        "attendanceType": "PRESENT",
        "remarks": null
      },
      {
        "id": "att-002-uuid",
        "studentId": "student-002-uuid",
        "attendanceDate": "2026-07-27",
        "attendanceType": "ABSENT",
        "remarks": "No reason provided"
      }
    ]
  },
  "total": 40,
  "page": 1,
  "limit": 40,
  "totalPages": 1
}
```

---

### 3.2 Monthly Attendance Report

**GET** `/api/v1/admin/attendance/report/monthly?tenantId={tenantId}&month=7&year=2026&classId={id}&page=1&limit=40`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Monthly attendance report retrieved",
  "data": [
    {
      "studentId": "student-001-uuid",
      "classId": "class-grade10a-uuid",
      "month": 7,
      "year": 2026,
      "presentDays": 20,
      "absentDays": 3,
      "lateDays": 1,
      "leaveDays": 0,
      "halfDays": 1,
      "medicalLeaveDays": 0,
      "workingDays": 25,
      "attendancePercentage": 84.0
    },
    {
      "studentId": "student-002-uuid",
      "classId": "class-grade10a-uuid",
      "month": 7,
      "year": 2026,
      "presentDays": 18,
      "absentDays": 7,
      "lateDays": 0,
      "leaveDays": 0,
      "halfDays": 0,
      "medicalLeaveDays": 0,
      "workingDays": 25,
      "attendancePercentage": 72.0
    }
  ],
  "total": 40,
  "page": 1,
  "limit": 40,
  "totalPages": 1
}
```

> **attendancePercentage formula:** (presentDays + halfDays × 0.5) / workingDays × 100  
> **workingDays** excludes HOLIDAY records.

---

### 3.3 Yearly Attendance Report

**GET** `/api/v1/admin/attendance/report/yearly?tenantId={tenantId}&year=2026&classId={id}&page=1&limit=40`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Yearly attendance report retrieved",
  "data": [
    {
      "studentId": "student-001-uuid",
      "year": 2026,
      "totalPresent": 180,
      "totalAbsent": 20,
      "totalLate": 8,
      "totalLeave": 5,
      "totalHalfDays": 4,
      "totalMedicalLeave": 2,
      "totalWorkingDays": 215,
      "overallPercentage": 87.44
    }
  ],
  "total": 40,
  "page": 1,
  "limit": 40,
  "totalPages": 1
}
```

---

### 3.4 Class Attendance Report (Date Range)

**GET** `/api/v1/admin/attendance/report/class/{classId}?tenantId={tenantId}&fromDate=2026-07-01&toDate=2026-07-28&page=1&limit=40`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Class attendance report retrieved",
  "data": [
    {
      "studentId": "student-001-uuid",
      "classId": "class-grade10a-uuid",
      "fromDate": "2026-07-01",
      "toDate": "2026-07-28",
      "presentDays": 20,
      "absentDays": 3,
      "lateDays": 1,
      "workingDays": 24,
      "attendancePercentage": 85.42,
      "records": [
        { "attendanceDate": "2026-07-01", "attendanceType": "PRESENT" },
        { "attendanceDate": "2026-07-02", "attendanceType": "ABSENT" }
      ]
    }
  ],
  "total": 40,
  "page": 1,
  "limit": 40,
  "totalPages": 1
}
```

---

### 3.5 Student Attendance Report

**GET** `/api/v1/admin/attendance/report/student/{studentId}?tenantId={tenantId}&academicYearId={id}&fromDate=2026-06-01&toDate=2026-07-28&page=1&limit=40`  
**Role:** ADMIN

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Student attendance report retrieved",
  "data": {
    "studentId": "student-001-uuid",
    "monthlySummary": [
      {
        "month": 6,
        "year": 2026,
        "presentDays": 22,
        "absentDays": 2,
        "workingDays": 24,
        "attendancePercentage": 91.67
      },
      {
        "month": 7,
        "year": 2026,
        "presentDays": 20,
        "absentDays": 4,
        "workingDays": 24,
        "attendancePercentage": 83.33
      }
    ],
    "records": [
      { "id": "att-001-uuid", "attendanceDate": "2026-07-28", "attendanceType": "PRESENT", "classId": "class-grade10a-uuid" },
      { "id": "att-002-uuid", "attendanceDate": "2026-07-27", "attendanceType": "ABSENT", "remarks": "Sick" }
    ]
  },
  "total": 44,
  "page": 1,
  "limit": 40,
  "totalPages": 2
}
```

---

### 3.6 Low-Attendance Report

**GET** `/api/v1/admin/attendance/report/low-attendance?tenantId={tenantId}&threshold=75&month=7&year=2026&classId={id}&page=1&limit=20`  
**Role:** ADMIN

> Returns students whose `attendancePercentage` is **below** the given threshold.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Low-attendance report retrieved",
  "data": [
    {
      "studentId": "student-010-uuid",
      "classId": "class-grade9b-uuid",
      "month": 7,
      "year": 2026,
      "presentDays": 14,
      "workingDays": 25,
      "attendancePercentage": 56.0
    },
    {
      "studentId": "student-025-uuid",
      "classId": "class-grade8a-uuid",
      "month": 7,
      "year": 2026,
      "presentDays": 17,
      "workingDays": 25,
      "attendancePercentage": 68.0
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 3.7 Attendance Percentage Report (Ranked)

**GET** `/api/v1/admin/attendance/report/percentage?tenantId={tenantId}&classId={id}&month=7&year=2026&page=1&limit=40`  
**Role:** ADMIN

> Students ranked by `attendancePercentage` ascending (lowest first).

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance percentage report retrieved",
  "data": [
    { "studentId": "student-010-uuid", "attendancePercentage": 56.0, "rank": 1 },
    { "studentId": "student-025-uuid", "attendancePercentage": 68.0, "rank": 2 },
    { "studentId": "student-003-uuid", "attendancePercentage": 72.0, "rank": 3 },
    { "studentId": "student-001-uuid", "attendancePercentage": 84.0, "rank": 4 },
    { "studentId": "student-007-uuid", "attendancePercentage": 96.0, "rank": 5 }
  ],
  "total": 40,
  "page": 1,
  "limit": 40,
  "totalPages": 1
}
```

---

## 4. Admin — Attendance Summary Recalculate

### 4.1 Recalculate Monthly Summary

**POST** `/api/v1/admin/attendance/summary/recalculate?studentId={studentId}&month=7&year=2026&tenantId={tenantId}`  
**Role:** ADMIN

> Use this to repair any drift in `AttendanceSummary`. Recomputes from raw attendance records.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance summary recalculated successfully",
  "data": {
    "studentId": "student-001-uuid",
    "month": 7,
    "year": 2026,
    "presentDays": 20,
    "absentDays": 3,
    "lateDays": 1,
    "leaveDays": 0,
    "halfDays": 1,
    "medicalLeaveDays": 0,
    "workingDays": 25,
    "attendancePercentage": 84.0,
    "tenantId": "tenant-001"
  }
}
```

---

## 5. Admin — Audit Trail

> Audit records are **immutable** — every create, update, and delete on an attendance record generates an audit entry automatically.

### 5.1 Get Audit Trail

**GET** `/api/v1/admin/attendance/audit?tenantId={tenantId}&attendanceId={id}&changedBy={email}&fromDate=2026-07-01&toDate=2026-07-28&page=1&limit=20`  
**Role:** ADMIN

> All filters except `tenantId` are optional.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Audit trail retrieved successfully",
  "data": [
    {
      "id": "audit-001-uuid",
      "attendanceId": "att-001-uuid",
      "action": "UPDATE",
      "changedBy": "admin@school.com",
      "changedAt": "2026-07-28T10:00:00",
      "previousValue": "{\"attendanceType\":\"PRESENT\",\"remarks\":null}",
      "newValue": "{\"attendanceType\":\"ABSENT\",\"remarks\":\"Correction by admin\"}",
      "tenantId": "tenant-001"
    },
    {
      "id": "audit-002-uuid",
      "attendanceId": "att-001-uuid",
      "action": "CREATE",
      "changedBy": "teacher@school.com",
      "changedAt": "2026-07-27T08:45:00",
      "previousValue": null,
      "newValue": "{\"attendanceType\":\"PRESENT\",\"attendanceDate\":\"2026-07-27\"}",
      "tenantId": "tenant-001"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

> **action values:** `CREATE` | `UPDATE` | `DELETE`  
> Results are ordered by `changedAt` descending (most recent first).

---

### 5.2 Audit — No Modification Allowed

**PUT / PATCH / DELETE** `/api/v1/admin/attendance/audit/{id}`

#### Response `405 Method Not Allowed`
```json
{
  "success": false,
  "message": "Audit records are immutable and cannot be modified",
  "error": "METHOD_NOT_ALLOWED",
  "code": 405
}
```

---

## 6. Teacher — Mark Attendance

### 6.1 Mark Attendance for Class

**POST** `/api/v1/teacher/attendance/mark?tenantId={tenantId}`  
**Role:** TEACHER

> Teacher can only mark attendance for **classes assigned to them** in `SMS_TEACHER_CLASSES`.  
> Teacher can only mark attendance for **today's date** (no past or future dates).

#### Request
```json
{
  "classId": "class-grade10a-uuid",
  "sectionId": "class-grade10a-uuid",
  "academicYearId": "acyr-001-uuid",
  "attendanceDate": "2026-07-28",
  "attendanceRecords": [
    { "studentId": "student-001-uuid", "attendanceType": "PRESENT", "remarks": null },
    { "studentId": "student-002-uuid", "attendanceType": "ABSENT", "remarks": "No reason" },
    { "studentId": "student-003-uuid", "attendanceType": "LATE", "remarks": "Arrived at 9:15" }
  ]
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": [
    {
      "id": "att-101-uuid",
      "studentId": "student-001-uuid",
      "classId": "class-grade10a-uuid",
      "attendanceDate": "2026-07-28",
      "attendanceType": "PRESENT",
      "markedBy": "teacher@school.com",
      "markedAt": "2026-07-28T08:50:00",
      "tenantId": "tenant-001"
    },
    {
      "id": "att-102-uuid",
      "studentId": "student-002-uuid",
      "classId": "class-grade10a-uuid",
      "attendanceDate": "2026-07-28",
      "attendanceType": "ABSENT",
      "remarks": "No reason",
      "markedBy": "teacher@school.com",
      "markedAt": "2026-07-28T08:50:00",
      "tenantId": "tenant-001"
    }
  ]
}
```

#### Error — Unassigned Class `403 Forbidden`
```json
{
  "success": false,
  "message": "You are not assigned to this class",
  "error": "ACCESS_DENIED",
  "code": 403
}
```

---

### 6.2 Update Attendance (Today Only)

**PUT** `/api/v1/teacher/attendance/{id}?tenantId={tenantId}`  
**Role:** TEACHER

> Teacher can only update records where `attendanceDate` equals **today**.

#### Request
```json
{
  "attendanceType": "PRESENT",
  "remarks": "Student arrived late but marked present after confirmation"
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "id": "att-102-uuid",
    "studentId": "student-002-uuid",
    "attendanceDate": "2026-07-28",
    "attendanceType": "PRESENT",
    "remarks": "Student arrived late but marked present after confirmation",
    "markedBy": "teacher@school.com",
    "version": 1,
    "tenantId": "tenant-001"
  }
}
```

#### Error — Past Record `403 Forbidden`
```json
{
  "success": false,
  "message": "Teachers can only edit today's attendance",
  "error": "BUSINESS_RULE_VIOLATION",
  "code": 403
}
```

---

## 7. Teacher — View Attendance

### 7.1 View Class Attendance for a Date

**GET** `/api/v1/teacher/attendance/class/{classId}?tenantId={tenantId}&attendanceDate=2026-07-28&page=1&limit=40`  
**Role:** TEACHER

> Only accessible for classes assigned to the teacher.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Class attendance retrieved successfully",
  "data": [
    {
      "id": "att-101-uuid",
      "studentId": "student-001-uuid",
      "attendanceDate": "2026-07-28",
      "attendanceType": "PRESENT",
      "markedBy": "teacher@school.com",
      "tenantId": "tenant-001"
    },
    {
      "id": "att-102-uuid",
      "studentId": "student-002-uuid",
      "attendanceDate": "2026-07-28",
      "attendanceType": "ABSENT",
      "remarks": "No reason",
      "tenantId": "tenant-001"
    }
  ],
  "total": 40,
  "page": 1,
  "limit": 40,
  "totalPages": 1
}
```

---

### 7.2 View Student Attendance History

**GET** `/api/v1/teacher/attendance/student/{studentId}?tenantId={tenantId}&fromDate=2026-07-01&toDate=2026-07-28&page=1&limit=20`  
**Role:** TEACHER

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Student attendance retrieved successfully",
  "data": [
    { "id": "att-101-uuid", "attendanceDate": "2026-07-28", "attendanceType": "PRESENT" },
    { "id": "att-090-uuid", "attendanceDate": "2026-07-27", "attendanceType": "ABSENT", "remarks": "Sick" },
    { "id": "att-080-uuid", "attendanceDate": "2026-07-26", "attendanceType": "PRESENT" }
  ],
  "total": 24,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### 7.3 View Today's Attendance (All Assigned Classes)

**GET** `/api/v1/teacher/attendance/today?tenantId={tenantId}`  
**Role:** TEACHER

> Returns all attendance records for **today** across all classes assigned to the teacher.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Today's attendance retrieved successfully",
  "data": [
    {
      "classId": "class-grade10a-uuid",
      "attendanceDate": "2026-07-28",
      "records": [
        { "studentId": "student-001-uuid", "attendanceType": "PRESENT" },
        { "studentId": "student-002-uuid", "attendanceType": "ABSENT" }
      ],
      "summary": { "present": 38, "absent": 2, "total": 40 }
    },
    {
      "classId": "class-grade9b-uuid",
      "attendanceDate": "2026-07-28",
      "records": [
        { "studentId": "student-050-uuid", "attendanceType": "PRESENT" }
      ],
      "summary": { "present": 40, "absent": 0, "total": 40 }
    }
  ]
}
```

---

## 8. Parent — View Child Attendance

> Parents can **only view** attendance for **their own children** (verified via `Student.parentId`).  
> Attempting to access another student's data returns `403 Forbidden`.

### 8.1 Get Child's Attendance Records

**GET** `/api/v1/parent/attendance?tenantId={tenantId}&studentId={studentId}&page=1&limit=20`  
**Role:** PARENT

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance records retrieved",
  "data": [
    { "id": "att-101-uuid", "attendanceDate": "2026-07-28", "attendanceType": "PRESENT", "classId": "class-grade10a-uuid" },
    { "id": "att-090-uuid", "attendanceDate": "2026-07-27", "attendanceType": "ABSENT", "remarks": "Sick" },
    { "id": "att-080-uuid", "attendanceDate": "2026-07-26", "attendanceType": "PRESENT" }
  ],
  "total": 46,
  "page": 1,
  "limit": 20,
  "totalPages": 3
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

### 8.2 Get Monthly Attendance Summary

**GET** `/api/v1/parent/attendance/monthly?tenantId={tenantId}&studentId={studentId}&month=7&year=2026`  
**Role:** PARENT

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Monthly attendance summary retrieved",
  "data": {
    "studentId": "student-001-uuid",
    "month": 7,
    "year": 2026,
    "presentDays": 20,
    "absentDays": 3,
    "lateDays": 1,
    "leaveDays": 0,
    "halfDays": 1,
    "medicalLeaveDays": 0,
    "workingDays": 25,
    "attendancePercentage": 84.0,
    "tenantId": "tenant-001"
  }
}
```

> If no records exist for the requested month, all counts return as `0`.

---

### 8.3 Get Yearly Attendance Summary

**GET** `/api/v1/parent/attendance/yearly?tenantId={tenantId}&studentId={studentId}&year=2026`  
**Role:** PARENT

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Yearly attendance summary retrieved",
  "data": {
    "studentId": "student-001-uuid",
    "year": 2026,
    "totalPresent": 180,
    "totalAbsent": 18,
    "totalLate": 8,
    "totalLeave": 4,
    "totalHalfDays": 3,
    "totalMedicalLeave": 2,
    "totalWorkingDays": 215,
    "overallPercentage": 87.21,
    "tenantId": "tenant-001"
  }
}
```

---

### 8.4 Get Current Month Summary Card

**GET** `/api/v1/parent/attendance/summary?tenantId={tenantId}&studentId={studentId}`  
**Role:** PARENT

> Returns this calendar month's summary — no month/year params needed.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Attendance summary retrieved",
  "data": {
    "studentId": "student-001-uuid",
    "month": 7,
    "year": 2026,
    "presentDays": 20,
    "absentDays": 3,
    "lateDays": 1,
    "workingDays": 25,
    "attendancePercentage": 84.0
  }
}
```

---

## 9. Error Responses

All errors follow the `ApiResponse` wrapper:

| HTTP Code | `error` field | When |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Missing required fields, invalid attendanceType, future date |
| `403` | `ACCESS_DENIED` | Teacher marking unassigned class, parent accessing another's child, teacher editing past record |
| `403` | `BUSINESS_RULE_VIOLATION` | Teacher attempting to update a past attendance record |
| `404` | `RESOURCE_NOT_FOUND` | Attendance record, student, or class not found |
| `405` | `METHOD_NOT_ALLOWED` | PUT/PATCH/DELETE on an audit record |
| `422` | `DUPLICATE_ATTENDANCE` | One record per student per day per tenant |
| `500` | Server error message | Unexpected exception |

#### Example — Validation Error `400`
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "studentId: must not be blank; attendanceType: must not be null",
  "code": 400
}
```

#### Example — Duplicate Attendance `422`
```json
{
  "success": false,
  "message": "Attendance already marked for this student on this date",
  "error": "DUPLICATE_ATTENDANCE",
  "code": 422
}
```

---

## 10. Attendance Lifecycle Flow

```
STEP 1 — Teacher Marks Attendance (Daily)
══════════════════════════════════════════
Teacher logs in → calls POST /api/v1/teacher/attendance/mark
  → Provides classId, attendanceDate (today), list of students + types
  → System validates: teacher owns class, date is today, no duplicate
  → Attendance records created (one per student)
  → AttendanceSummary updated atomically for each student's month
  → Audit record inserted (action=CREATE)

STEP 2 — Teacher Corrects (Same Day Only)
══════════════════════════════════════════
Teacher notices a mistake (same day) → calls PUT /api/v1/teacher/attendance/{id}
  → System validates: attendanceDate = today
  → Record updated, summary recalculated, audit inserted (action=UPDATE)
  → If next day: teacher cannot update → Admin must correct instead

STEP 3 — Admin Override (Any Date)
════════════════════════════════════
Admin corrects historical record → PUT /api/v1/admin/attendance/{id}
  → No date restriction for admin
  → Record updated, summary recalculated, audit inserted (action=UPDATE)

STEP 4 — Attendance Summary Auto-Updated
══════════════════════════════════════════
Every create/update/delete → AttendanceSummary recomputed for that student + month:
  presentDays = count(PRESENT records this month for student)
  absentDays  = count(ABSENT records)
  workingDays = total records − HOLIDAY records
  percentage  = (presentDays + halfDays × 0.5) / workingDays × 100

STEP 5 — Reporting & Dashboard
════════════════════════════════
Admin:  Dashboard (live counts today) / Daily / Monthly / Yearly / Class / Student / Low-Attendance / Percentage
Teacher: Class view (assigned classes only) / Student history / Today's summary
Parent:  Child's records (own child only) / Monthly summary / Yearly summary / Current month card
```

### Attendance Type Reference

| Type | Counts as | In workingDays |
|---|---|---|
| `PRESENT` | 1 present day | ✅ Yes |
| `ABSENT` | 1 absent day | ✅ Yes |
| `LATE` | 1 late day | ✅ Yes |
| `HALF_DAY` | 0.5 present | ✅ Yes |
| `LEAVE` | 1 leave day | ✅ Yes |
| `MEDICAL_LEAVE` | 1 medical leave | ✅ Yes |
| `HOLIDAY` | 1 holiday | ❌ No (excluded) |

### Role Access Summary

| Operation | ADMIN | TEACHER | PARENT |
|---|---|---|---|
| Mark attendance | ✅ Any date | ✅ Today only, assigned class | ❌ |
| Update attendance | ✅ Any date | ✅ Today only | ❌ |
| Delete attendance | ✅ | ❌ | ❌ |
| View records | ✅ All | ✅ Assigned classes | ✅ Own child only |
| Dashboard | ✅ | ❌ | ❌ |
| Reports (all types) | ✅ | ❌ | ❌ |
| Audit trail | ✅ | ❌ | ❌ |
| Monthly/Yearly summary | ✅ | ✅ | ✅ Own child |

---

*Run `sql/attendance_module_phase1_ddl.sql` against Oracle DB before starting the application.*

