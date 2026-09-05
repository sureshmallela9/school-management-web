# Attendance Module — Simple Guide (Plain English)

> **Our story characters:**
> - 🏫 **Hyderabad Public School** — the school
> - 👦 **Teja** — student, studying in **Class 10-A**
> - 👨 **Guru** — Teja's father (the parent)
> - 👩‍💼 **Priya** — the school admin
> - 👨‍🏫 **Ravi Sir** — class teacher of 10-A

---

## 1. What is Attendance?

**What it is:** A daily record of whether each student came to school, arrived late, took leave, or was absent.

**Example:**
> Every morning, Ravi Sir opens the app and marks attendance for his Class 10-A students.  
> He marks Teja as **PRESENT**, marks Arjun as **ABSENT**, and marks Preethi as **LATE**.

**Attendance types:**

| Type | Meaning |
|---|---|
| **PRESENT** | Student came on time |
| **ABSENT** | Student did not come |
| **LATE** | Student came late |
| **HALF_DAY** | Student came for only half the day |
| **LEAVE** | Student took approved leave |
| **MEDICAL_LEAVE** | Student was sick and has a medical note |
| **HOLIDAY** | School holiday — no one expected |

---

## 2. Who Can Do What?

Think of it like three different views of the same attendance data:

### 👨‍🏫 Ravi Sir (Teacher)
- ✅ Can **mark attendance** for his own classes — only today, not yesterday or tomorrow
- ✅ Can **fix a mistake** he made — but only on the same day
- ✅ Can **see** attendance for his classes and his students
- ❌ Cannot touch another teacher's class
- ❌ Cannot change yesterday's record

### 👩‍💼 Priya (Admin)
- ✅ Can **mark, edit, or delete** attendance for any student, any date
- ✅ Can see the **school-wide dashboard** — how many students are present today
- ✅ Can run **reports** — daily, monthly, yearly, class-wise, student-wise
- ✅ Can see the full **audit trail** — who changed what and when

### 👨 Guru (Parent)
- ✅ Can see **Teja's attendance** — daily records, monthly summary, yearly overview
- ❌ Cannot see another student's attendance
- ❌ Cannot mark or change any attendance

---

## 3. How Attendance is Marked (Daily Flow)

```
MORNING — Ravi Sir marks attendance for Class 10-A
──────────────────────────────────────────────────
8:50 AM — Ravi Sir opens the app
           He selects: Class 10-A, Date: today (28 July 2026)
           He goes through the student list and marks each one:

           Teja     → PRESENT
           Arjun    → ABSENT  (forgot note)
           Preethi  → LATE    (arrived at 9:15 AM)
           Sana     → LEAVE   (informed yesterday)

           He hits Submit.

SYSTEM — What happens automatically
─────────────────────────────────────
✅ 4 attendance records are created (one per student)
✅ Teja's July attendance summary is updated:
   presentDays: 20 → 21
   attendancePercentage recalculated: 84%

✅ Audit log entry is created for each record
```

---

## 4. Correcting a Mistake

### Same day (Teacher can fix it)
> Ravi Sir realizes he accidentally marked Arjun as ABSENT but Arjun was actually LATE.  
> He updates the record before end of day → ✅ Allowed.  
> Audit log records: `ABSENT → LATE, changed by teacher@school.com at 2:30 PM`

### Next day (Only Admin can fix it)
> Next morning, Ravi Sir notices yesterday's mistake but the app won't let him change it.  
> He calls Priya.  
> Priya logs in as Admin → finds the record → updates it → ✅ Done.  
> Audit log records: `ABSENT → LATE, changed by admin@school.com on 29 July`

---

## 5. Attendance Summary — Teja's Report Card

After a full month of attendance, the system automatically keeps a running **summary** for Teja:

**Teja's July 2026 Summary:**

| Metric | Value |
|---|---|
| Present Days | 20 |
| Absent Days | 3 |
| Late Days | 1 |
| Half Days | 1 |
| Leave Days | 0 |
| Medical Leave | 0 |
| Working Days | 25 |
| **Attendance %** | **84.0%** |

> **How % is calculated:**  
> (20 present + 1 half_day × 0.5) / 25 working days × 100 = **84.0%**  
> Holidays are not counted in working days.

---

## 6. Full Flow — Teja's Attendance Journey (One Month)

```
JULY 2026
──────────
July 1 → Ravi Sir marks Class 10-A: Teja = PRESENT
July 2 → Ravi Sir marks: Teja = PRESENT
July 3 → Ravi Sir marks: Teja = ABSENT (Teja was sick)
         Guru (Teja's dad) opens the app → sees ABSENT for July 3

July 4 → Priya marks Teja as MEDICAL_LEAVE (Guru submitted a sick note)
         July 3 entry is corrected: ABSENT → MEDICAL_LEAVE
         Audit trail records the change.

... (rest of month) ...

July 28 → End of July
           Teja's summary: 20 present, 3 absent, 1 medical leave, 1 late, 84.0%

Guru opens the app:
  → Monthly Summary: 84.0% ✅
  → He notices Teja's attendance is above 75% — no alert

Other student (Arjun): 56.0%
  → Appears in Priya's "Low Attendance" report
  → Priya calls Arjun's parents
```

---

## 7. What the Dashboard Shows (Admin Only)

Priya opens the attendance dashboard every morning:

```
TODAY — 28 July 2026
─────────────────────
Total Students:         450
Present Today:          390  (86.7%)
Absent Today:            35
Late Today:              12
On Leave:                 8
Half Day:                 5
Holiday:                  0

⚠️  Students below 75% this month:
  • Arjun Reddy   (Class 9-B) — 56.0%
  • Meera Patel   (Class 8-A) — 68.0%
  • 6 more...

Class Summary:
  Class 10-A: 38 present / 2 absent (out of 40)
  Class 9-B:  34 present / 6 absent (out of 40)
```

---

## 8. Reports Priya Can Run

| Report | What it shows |
|---|---|
| **Daily** | All records for one date (optionally filtered by class) |
| **Monthly** | Each student's summary (present/absent/%) for a given month |
| **Yearly** | Totals across all months of the year |
| **Class (Date Range)** | One class's attendance between any two dates |
| **Student** | One student's full history with month-by-month breakdown |
| **Low Attendance** | Students whose % is below a threshold (default 75%) |
| **Percentage Ranked** | All students ranked from lowest to highest attendance % |

---

## 9. What Guru (Parent) Can See

Guru opens the parent app to check Teja's attendance:

```
TEJA'S ATTENDANCE — July 2026
───────────────────────────────
July 28 → PRESENT
July 27 → ABSENT
July 26 → PRESENT
...

MONTHLY SUMMARY
  Present:     20 days
  Absent:       3 days
  Late:         1 day
  Working Days: 25
  Percentage:  84.0% ✅

YEARLY SUMMARY (2026)
  Total Present:     180 days
  Total Absent:       18 days
  Overall %:         87.2% ✅
```

> Guru **cannot see** any other student's data — the system blocks it.

---

## 10. Common Scenarios

### Scenario 1 — Ravi Sir forgets to mark attendance
> It's 3 PM and Ravi Sir hasn't marked Class 10-A yet.  
> He opens the app → marks all students for today → ✅ Done.  
> (He can still mark today's attendance any time before midnight.)

### Scenario 2 — School declares a holiday mid-day
> Priya marks all students in all classes as **HOLIDAY** for that date.  
> The system excludes this day from "working days" in all percentage calculations.  
> Teja's % is unaffected.

### Scenario 3 — Arjun's attendance drops below 75%
> After July 15, Arjun's monthly attendance drops to 68%.  
> He appears on Priya's dashboard in the "⚠️ Below 75%" alert list.  
> Priya runs the **Low Attendance Report** → calls Arjun's parents.

### Scenario 4 — Admin needs to fix last month's wrong entry
> Priya finds that Teja was incorrectly marked ABSENT on June 10 (he was actually PRESENT).  
> She opens Admin → finds the record → changes it to PRESENT.  
> The system automatically recalculates Teja's June summary.  
> Audit trail records the change with timestamp and Priya's email.

### Scenario 5 — Teacher leaves, new teacher assigned
> New teacher joins for Class 9-B.  
> Admin assigns them to Class 9-B in the system.  
> The new teacher can now immediately mark attendance for 9-B.  
> Old teacher can no longer mark for 9-B.

---

## 11. The Audit Trail — Nothing is Hidden

Every single change to attendance is recorded permanently:

```
AUDIT LOG for Teja's July 3 record:
────────────────────────────────────
1. CREATE  | July 3, 8:55 AM  | teacher@school.com | ABSENT
2. UPDATE  | July 4, 10:00 AM | admin@school.com   | ABSENT → MEDICAL_LEAVE
```

> Audit records can **never be edited or deleted** — they are permanent.  
> Only Priya (Admin) can read the audit trail.

---

## 12. Quick Glossary

| Word | Plain English meaning |
|---|---|
| **Attendance Record** | One row: this student, this date, this status |
| **PRESENT** | Student came to school on time |
| **ABSENT** | Student did not come |
| **LATE** | Student came after the bell |
| **HALF_DAY** | Student was present for only half the day (counts as 0.5) |
| **LEAVE** | Approved absence |
| **MEDICAL_LEAVE** | Sick leave with a doctor's note |
| **HOLIDAY** | School holiday — not counted in working days |
| **Working Days** | Total days counted for % calculation (excludes HOLIDAY) |
| **Attendance %** | (Present + HalfDay×0.5) ÷ WorkingDays × 100 |
| **Attendance Summary** | Monthly report card: how many days present, absent, % etc. |
| **Audit Trail** | Permanent log of every change — who changed what and when |
| **Below 75%** | Warning threshold — student may need attention |
| **Dashboard** | Admin's live view of today's school-wide attendance |

