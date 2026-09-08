# Fee Module — Simple Guide (Plain English)

> **Our story characters:**
> - 🏫 **Hyderabad Public School** — the school
> - 👦 **Teja** — student, studying in **Class 10-C**
> - 👨 **Guru** — Teja's father (the parent)
> - 👩‍💼 **Priya** — the school admin who manages fees
> - 👨‍🏫 **Ravi Sir** — class teacher of 10-C

---

## 1. Academic Year

**What it is:** The school year. Everything (fees, terms, structures) belongs to one academic year.

**Example:**
> Priya creates the academic year **"2025-2026"** starting June 1, 2025 and ending May 31, 2026.

**Rules:**
- Only one academic year should be **active** at a time
- You can deactivate the old year and activate the new one each June

---

## 2. Fee Category

**What it is:** The *type* of fee. A label for what the money is for.

**Example — Hyderabad Public School has these categories:**

| Category | What it means |
|---|---|
| **Tuition** | Regular classroom teaching |
| **Library** | Access to the school library |
| **Laboratory** | Science lab usage |
| **Sports** | Sports, PE, and activities |
| **Transport** | School bus charges |

> Priya creates these 5 categories once. They reuse every year.

---

## 3. Fee Term

**What it is:** The *time period* for which a fee is charged.  
Think of it like — *when* is the fee due?

**Example:**
> For the 2025-2026 year, Priya creates 2 terms:
> - **Term 1** → June 2025 to November 2025
> - **Term 2** → December 2025 to May 2026

**Other options:** Annual (once a year), Quarterly (4 times), Monthly, or any Custom period.

---

## 4. Fee Structure

**What it is:** The *actual amount* a specific class owes for a specific category in a specific term.

Think of it as the **fee chart on the school notice board**.

**Example — Priya sets up the fee structure for Class 10-C, Term 1:**

| Class | Category | Term | Amount | Due Date |
|---|---|---|---|---|
| 10-C | Tuition | Term 1 | ₹15,000 | 15 July 2025 |
| 10-C | Library | Term 1 | ₹500 | 15 July 2025 |
| 10-C | Transport | Term 1 | ₹8,000 | 15 July 2025 |

> So Class 10-C students owe ₹23,500 total for Term 1.

---

## 5. Fee Assignment

**What it is:** Applying the fee structure to actual students.  
Fee structures are just a *plan* — assignment makes it *real* for each student.

**Two ways to assign:**

### Option A — Assign to the whole class (bulk)
> Priya assigns the ₹15,000 Tuition structure to **all students in Class 10-C**.  
> Every student in 10-C automatically gets a fee of ₹15,000 added to their record.

### Option B — Assign to one student (individual override)
> Teja has a scholarship. Priya assigns the Tuition fee to **Teja only** with an override of **₹10,000** instead of ₹15,000.  
> Teja pays less than his classmates.

---

## 6. Student Fee Ledger

**What it is:** Teja's personal **fee account book** in the system.  
It tracks how much Teja owes, how much he has paid, and how much is still pending.

**Example — Teja's ledger after assignment:**

| Fee | Total | Paid | Still Owed | Status |
|---|---|---|---|---|
| Tuition (Term 1) | ₹10,000 | ₹0 | ₹10,000 | **PENDING** |
| Library (Term 1) | ₹500 | ₹0 | ₹500 | **PENDING** |
| Transport (Term 1) | ₹8,000 | ₹0 | ₹8,000 | **PENDING** |

> The ledger is **created automatically** when Priya does the fee assignment.  
> Guru (Teja's dad) doesn't need to do anything yet.

**Status meanings:**
| Status | Meaning |
|---|---|
| **PENDING** | Nothing paid yet |
| **PARTIAL** | Some amount paid, balance remaining |
| **PAID** | Fully cleared ✅ |

---

## 7. Fee Receipt

**What it is:** Proof that Guru paid some amount. Like a **payment receipt** you get at a bank.

**Example — Guru pays ₹5,000 towards Teja's Tuition:**
> Priya records the payment in the system.  
> The system generates a receipt: **REC-2025-000001**

**After this payment, Teja's ledger updates automatically:**

| Fee | Total | Paid | Still Owed | Status |
|---|---|---|---|---|
| Tuition (Term 1) | ₹10,000 | ₹5,000 | ₹5,000 | **PARTIAL** |

> Guru pays the remaining ₹5,000 next month → Receipt **REC-2025-000042** is generated → Status becomes **PAID** ✅

**Important rules about receipts:**
- Once a receipt is generated, it **cannot be changed or deleted** (it's a permanent record)
- Guru **cannot overpay** — if Teja owes ₹5,000 and Guru tries to pay ₹6,000, the system will reject it

---

## 8. Full Flow — Teja's Fee Journey (End to End)

```
JUNE 2025
─────────
Priya creates Academic Year "2025-2026"
Priya creates Fee Categories (Tuition, Library, Transport...)
Priya creates Fee Terms (Term 1: Jun–Nov, Term 2: Dec–May)
Priya creates Fee Structure for Class 10-C:
  → Tuition ₹10,000, Library ₹500, Transport ₹8,000 (due 15 July)

Priya assigns fees to Class 10-C (all students including Teja)
  → Teja's ledger is created:  Total ₹18,500 | Paid ₹0 | PENDING

JULY 2025
─────────
Guru visits school and pays ₹10,000
  → Priya records payment against Teja's Tuition entry
  → Receipt REC-2025-000001 generated (₹10,000)
  → Teja's Tuition: Paid ₹10,000 | Owed ₹0 | ✅ PAID
  → Library ₹500 still PENDING
  → Transport ₹8,000 still PENDING

AUGUST 2025
───────────
Guru pays remaining ₹8,500 (Library + Transport together)
  → Priya records ₹500 against Library entry
     → Receipt REC-2025-000015 (₹500) → Library ✅ PAID
  → Priya records ₹8,000 against Transport entry
     → Receipt REC-2025-000016 (₹8,000) → Transport ✅ PAID

ALL FEES CLEARED for Term 1 ✅
```

---

## 9. What Each Person Sees

### 👩‍💼 Priya (Admin) — Sees Everything
- Fee dashboard: total collected, total outstanding, overdue students
- Monthly collection summary (how much came in each month)
- Reports per student, per class, all overdue, all paid

### 👦 Teja / 👨 Guru (Parent) — Sees Only Teja's Data
- Teja's fee summary: what is owed, what is paid, what is pending
- All receipts generated for Teja
- **Cannot see** other students' fee data

### 👨‍🏫 Ravi Sir (Teacher) — Sees Only His Class
- Fee summary for Class 10-C (which students paid, who has pending)
- **Cannot create, update, or delete** any fee data — read only
- **Cannot see** other classes' data

---

## 10. Common Scenarios

### Scenario 1 — Teja gets a scholarship discount
> Priya assigns Tuition separately to Teja with ₹10,000 instead of ₹15,000 (the class rate).  
> All other 10-C students still owe ₹15,000. Only Teja's entry shows ₹10,000.

### Scenario 2 — Guru pays in 3 instalments
> Receipt 1: ₹5,000 → Tuition becomes PARTIAL  
> Receipt 2: ₹5,000 → Tuition becomes PAID  
> Receipt 3: ₹500 → Library becomes PAID  
> Each payment gets its own receipt number. All 3 receipts are permanent.

### Scenario 3 — Checking overdue fees
> Priya runs the **Overdue Report** in October.  
> It shows all students whose due date was 15 July but still have PENDING or PARTIAL status.  
> Teja is not on the list (he paid everything). His classmate Arjun is on the list.

### Scenario 4 — New academic year starts
> June 2026: Priya creates Academic Year "2026-2027"  
> She deactivates "2025-2026"  
> Creates new fee structures (maybe Tuition goes up to ₹12,000)  
> Assigns to all classes again → new ledger entries created for all students  
> Old year's ledger is preserved as history

---

## 11. Quick Glossary

| Word | Plain English meaning |
|---|---|
| **Academic Year** | The school year (e.g. June 2025 – May 2026) |
| **Fee Category** | Type of fee (Tuition, Library, Transport…) |
| **Fee Term** | Time period the fee covers (Term 1, Term 2, Annual…) |
| **Fee Structure** | The fee chart — how much a class owes for each category |
| **Fee Assignment** | Applying the fee chart to actual students |
| **Ledger Entry** | One fee line in a student's fee account |
| **Receipt** | Proof of payment (permanent, cannot be changed) |
| **PENDING** | Student hasn't paid anything yet |
| **PARTIAL** | Student paid some, still owes the rest |
| **PAID** | Student has cleared the full fee ✅ |
| **Override Amount** | A special discounted amount set for one student |
| **Overdue** | Due date has passed but fee is still not fully paid |

