import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AcademicYear,
  FeeAssignment,
  FeeCategory,
  FeeReceiptRequest,
  FeeStructure,
  FeeStructureRequest,
  FeeTerm,
  FeeTermRequest,
  StudentFeeLedger,
} from '../fees.model';
import { AuthService } from '../../../core/services/auth.service';
import { FeeService } from '../fees.service';
import { FeeLookupService } from '../fee-lookup.service';

type FeeTab = 'years' | 'categories' | 'terms' | 'structures' | 'assignments' | 'ledger' | 'receipts';

@Component({
  selector: 'app-fee-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">QSchool finance</p>
          <h1>Fee management</h1>
          <p class="lede">Set up the academic year, define fee structures, assign them, and record receipts.</p>
        </div>
        <a class="ghost-link" routerLink="/admin/fees">Back to dashboard</a>
      </header>

      <nav class="tabs" aria-label="Fee management sections">
        <button *ngFor="let tab of tabs" type="button" [class.active]="activeTab === tab.value" (click)="selectTab(tab.value)">{{ tab.label }}</button>
      </nav>

      <p class="success-text" *ngIf="successMessage">{{ successMessage }}</p>
      <p class="error-text" *ngIf="errorMessage">{{ errorMessage }}</p>

      <section class="panel" *ngIf="activeTab === 'years'">
        <div class="panel-heading"><div><p class="section-kicker">Academic years</p><h2>School calendar</h2></div><button class="primary-btn" type="button" (click)="saveAcademicYear()">{{ editingYearId ? 'Update year' : 'Add year' }}</button></div>
        <form class="form-grid" (ngSubmit)="saveAcademicYear()">
          <label>Name<input [(ngModel)]="yearForm.name" name="yearName" required placeholder="2026-2027" /></label>
          <label>Start date<input type="date" [(ngModel)]="yearForm.startDate" name="yearStart" required /></label>
          <label>End date<input type="date" [(ngModel)]="yearForm.endDate" name="yearEnd" required /></label>
          <label class="check-label"><input type="checkbox" [(ngModel)]="yearForm.active" name="yearActive" /> Active</label>
        </form>
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          <tr *ngFor="let year of academicYears"><td>{{ year.name }}</td><td>{{ year.startDate }} to {{ year.endDate }}</td><td>{{ year.active ? 'Active' : 'Inactive' }}</td><td class="actions"><button type="button" (click)="editYear(year)">Edit</button><button type="button" [disabled]="!year.active" (click)="deactivateYear(year)">Deactivate</button></td></tr>
          <tr *ngIf="!academicYears.length"><td colspan="4" class="empty-cell">No academic years found.</td></tr>
        </tbody></table></div>
      </section>

      <section class="panel" *ngIf="activeTab === 'categories'">
        <div class="panel-heading"><div><p class="section-kicker">Fee categories</p><h2>What families pay for</h2></div><button class="primary-btn" type="button" (click)="saveCategory()">{{ editingCategoryId ? 'Update category' : 'Add category' }}</button></div>
        <form class="form-grid" (ngSubmit)="saveCategory()"><label>Name<input [(ngModel)]="categoryForm.name" name="categoryName" required placeholder="Tuition" /></label><label>Description<input [(ngModel)]="categoryForm.description" name="categoryDescription" placeholder="Core academic fee" /></label></form>
        <div class="chip-list"><article class="chip-row" *ngFor="let category of categories"><div><strong>{{ category.name }}</strong><span>{{ category.description || 'No description' }}</span></div><div class="actions"><button type="button" (click)="editCategory(category)">Edit</button><button type="button" (click)="deleteCategory(category)">Delete</button></div></article><p *ngIf="!categories.length" class="empty-cell">No categories found.</p></div>
      </section>

      <section class="panel" *ngIf="activeTab === 'terms'">
        <div class="panel-heading"><div><p class="section-kicker">Fee terms</p><h2>When fees are due</h2></div><button class="primary-btn" type="button" (click)="saveTerm()">{{ editingTermId ? 'Update term' : 'Add term' }}</button></div>
        <form class="form-grid" (ngSubmit)="saveTerm()"><label>Academic year<select [(ngModel)]="termForm.academicYearId" name="termYear" required><option value="">Select year</option><option *ngFor="let year of academicYears" [value]="year.id">{{ year.name }}</option></select></label><label>Label<input [(ngModel)]="termForm.label" name="termLabel" required placeholder="Term 1" /></label><label>Frequency<select [(ngModel)]="termForm.frequency" name="termFrequency"><option>ANNUAL</option><option>SEMESTER</option><option>QUARTER</option><option>MONTHLY</option><option>CUSTOM</option></select></label><label>Start date<input type="date" [(ngModel)]="termForm.startDate" name="termStart" /></label><label>End date<input type="date" [(ngModel)]="termForm.endDate" name="termEnd" /></label></form>
        <div class="table-wrap"><table><thead><tr><th>Label</th><th>Frequency</th><th>Academic year</th><th>Dates</th><th>Actions</th></tr></thead><tbody><tr *ngFor="let term of terms"><td>{{ term.label }}</td><td>{{ term.frequency }}</td><td>{{ lookup.academicYearName(term.academicYearId) }}</td><td>{{ term.startDate || '-' }} to {{ term.endDate || '-' }}</td><td><button type="button" (click)="editTerm(term)">Edit</button></td></tr><tr *ngIf="!terms.length"><td colspan="5" class="empty-cell">Select an academic year to load terms.</td></tr></tbody></table></div>
      </section>

      <section class="panel" *ngIf="activeTab === 'structures'">
        <div class="panel-heading"><div><p class="section-kicker">Fee structures</p><h2>Amounts by class and term</h2></div><button class="primary-btn" type="button" (click)="saveStructure()">{{ editingStructureId ? 'Update structure' : 'Add structure' }}</button></div>
        <form class="form-grid" (ngSubmit)="saveStructure()"><label>Academic year<select [(ngModel)]="structureForm.academicYearId" name="structureYear" required><option value="">Select year</option><option *ngFor="let year of academicYears" [value]="year.id">{{ year.name }}</option></select></label><label>Class ID<input [(ngModel)]="structureForm.classId" name="structureClass" required placeholder="class-grade10" /></label><label>Category<select [(ngModel)]="structureForm.feeCategoryId" name="structureCategory" required><option value="">Select category</option><option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option></select></label><label>Term<select [(ngModel)]="structureForm.feeTermId" name="structureTerm" required><option value="">Select term</option><option *ngFor="let term of terms" [value]="term.id">{{ term.label }}</option></select></label><label>Amount<input type="number" min="0.01" step="0.01" [(ngModel)]="structureForm.amount" name="structureAmount" required /></label><label>Due date<input type="date" [(ngModel)]="structureForm.dueDate" name="structureDue" required /></label></form>
        <div class="table-wrap"><table><thead><tr><th>Class</th><th>Category</th><th>Amount</th><th>Due date</th><th>Actions</th></tr></thead><tbody><tr *ngFor="let structure of structures"><td>{{ lookup.className(structure.classId) }}</td><td>{{ lookup.feeCategoryNameById(structure.feeCategoryId) }}</td><td>{{ structure.amount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ structure.dueDate }}</td><td class="actions"><button type="button" (click)="editStructure(structure)">Edit</button><button type="button" (click)="deleteStructure(structure)">Delete</button></td></tr><tr *ngIf="!structures.length"><td colspan="5" class="empty-cell">No fee structures found.</td></tr></tbody></table></div>
      </section>

      <section class="panel" *ngIf="activeTab === 'ledger'">
        <div class="panel-heading"><div><p class="section-kicker">Student fee ledger</p><h2>Balances and payment status</h2></div><button class="primary-btn" type="button" (click)="loadLedger()">Refresh</button></div>
        <div class="filter-row"><label>Status<select [(ngModel)]="ledgerStatus" name="ledgerStatus" (ngModelChange)="loadLedger()"><option value="">All</option><option>PENDING</option><option>PARTIAL</option><option>PAID</option></select></label><label>Class ID<input [(ngModel)]="ledgerClassId" name="ledgerClassId" (keyup.enter)="loadLedger()" /></label></div>
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Class</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Due</th></tr></thead><tbody><tr *ngFor="let entry of ledger"><td>{{ lookup.studentName(entry.studentId) }}</td><td>{{ lookup.className(entry.classId) }}</td><td>{{ entry.totalAmount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ entry.paidAmount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ entry.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ entry.status }}</td><td>{{ entry.dueDate }}</td></tr><tr *ngIf="!ledger.length"><td colspan="7" class="empty-cell">No ledger entries found.</td></tr></tbody></table></div>
      </section>

      <section class="panel" *ngIf="activeTab === 'assignments'">
        <div class="panel-heading"><div><p class="section-kicker">Fee assignments</p><h2>Apply a structure to a student</h2></div><button class="primary-btn" type="button" (click)="assignFee()">Assign fee</button></div>
        <form class="form-grid" (ngSubmit)="assignFee()"><label>Structure ID<input [(ngModel)]="assignmentForm.feeStructureId" name="assignmentStructure" required /></label><label>Student ID<input [(ngModel)]="assignmentForm.studentId" name="assignmentStudent" required /></label><label>Override amount<input type="number" min="0.01" step="0.01" [(ngModel)]="assignmentForm.overrideAmount" name="assignmentAmount" /></label></form>
        <div class="panel-heading compact-heading"><div><p class="section-kicker">Class assignment</p><h2>Apply to a whole class</h2></div><button class="primary-btn" type="button" (click)="assignClassFee()">Assign class fee</button></div>
        <form class="form-grid" (ngSubmit)="assignClassFee()"><label>Structure ID<input [(ngModel)]="classAssignmentForm.feeStructureId" name="classAssignmentStructure" required /></label><label>Class ID<input [(ngModel)]="classAssignmentForm.classId" name="classAssignmentClass" required /></label><label>Override amount<input type="number" min="0.01" step="0.01" [(ngModel)]="classAssignmentForm.overrideAmount" name="classAssignmentAmount" /></label></form>
        <div class="table-wrap"><table><thead><tr><th>Fee structure</th><th>Assigned to</th><th>Override</th><th>Actions</th></tr></thead><tbody><tr *ngFor="let assignment of assignments"><td>{{ lookup.structureSummary(assignment.feeStructureId) }}</td><td>{{ assignment.studentId ? lookup.studentName(assignment.studentId) : (assignment.classId ? lookup.className(assignment.classId) + ' (whole class)' : '-') }}</td><td>{{ assignment.overrideAmount ?? '-' }}</td><td><button type="button" (click)="deleteAssignment(assignment)">Remove</button></td></tr><tr *ngIf="!assignments.length"><td colspan="4" class="empty-cell">No assignments found.</td></tr></tbody></table></div>
      </section>

      <section class="panel" *ngIf="activeTab === 'receipts'">
        <div class="panel-heading"><div><p class="section-kicker">Fee receipts</p><h2>Record a payment</h2></div><button class="primary-btn" type="button" [disabled]="isOverpayment" (click)="saveReceipt()">Generate receipt</button></div>
        <form class="form-grid" (ngSubmit)="saveReceipt()">
          <label>Ledger entry<select [(ngModel)]="receiptForm.ledgerEntryId" name="receiptLedger" required>
            <option value="">Select a pending ledger entry</option>
            <option *ngFor="let entry of ledger" [value]="entry.id">{{ lookup.studentName(entry.studentId) }} · outstanding {{ entry.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</option>
          </select></label>
          <label>Amount paid<input type="number" min="0.01" [(ngModel)]="receiptForm.amountPaid" name="receiptAmount" required /></label>
          <label>Receipt date<input type="date" [(ngModel)]="receiptForm.receiptDate" name="receiptDate" required /></label>
          <label>Remarks<input [(ngModel)]="receiptForm.remarks" name="receiptRemarks" /></label>
        </form>
        <p class="error-text" *ngIf="isOverpayment">Amount paid cannot exceed the outstanding balance of {{ selectedLedgerEntry?.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}.</p>
        <div class="table-wrap"><table><thead><tr><th>Receipt</th><th>Student</th><th>Amount</th><th>Date</th><th>Remarks</th></tr></thead><tbody><tr *ngFor="let receipt of receipts"><td>{{ receipt.receiptNumber }}</td><td>{{ lookup.studentName(receipt.studentId) }}</td><td>{{ receipt.amountPaid | currency:'INR':'symbol':'1.0-0' }}</td><td>{{ receipt.receiptDate }}</td><td>{{ receipt.remarks || '-' }}</td></tr><tr *ngIf="!receipts.length"><td colspan="5" class="empty-cell">No receipts found.</td></tr></tbody></table></div>
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; }.page-shell { display: grid; gap: 20px; max-width: 1200px; margin: 0 auto; }.page-header { display: flex; justify-content: space-between; align-items: end; gap: 20px; }.eyebrow, .section-kicker { margin: 0 0 7px; text-transform: uppercase; letter-spacing: .14em; font-size: .7rem; color: #0f766e; font-weight: 800; }h1, h2 { margin: 0; color: #102a43; }h1 { font-size: clamp(2rem, 4vw, 3.1rem); letter-spacing: -.04em; margin-bottom: 8px; }.lede { margin: 0; color: #62748a; }.ghost-link { color: #0f766e; font-weight: 800; text-decoration: none; }.tabs { display: flex; gap: 8px; flex-wrap: wrap; }.tabs button, .primary-btn, .actions button { border: 0; border-radius: 8px; padding: 10px 13px; font: inherit; font-weight: 800; cursor: pointer; }.tabs button { background: #e8f0f5; color: #52657a; }.tabs button.active, .primary-btn { background: #102a43; color: white; }.panel { background: white; border: 1px solid #e6edf3; border-radius: 12px; padding: 22px; box-shadow: 0 10px 24px rgba(16,42,67,.05); }.panel-heading { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 18px; }.form-grid, .filter-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }.form-grid label, .filter-row label { display: grid; gap: 6px; font-weight: 700; color: #334155; font-size: .84rem; }.form-grid input, .form-grid select, .filter-row input, .filter-row select { width: 100%; box-sizing: border-box; border: 1px solid #dfe7f5; border-radius: 8px; padding: 10px 12px; font: inherit; background: white; }.check-label { display: flex !important; align-items: center; gap: 8px; }.check-label input { width: auto; }.table-wrap { overflow-x: auto; }table { width: 100%; border-collapse: collapse; }th, td { padding: 13px 11px; border-bottom: 1px solid #edf1f5; text-align: left; white-space: nowrap; }th { background: #f7fafc; color: #52657a; font-size: .8rem; }.actions { display: flex; gap: 6px; }.actions button { background: #e8f0f5; color: #102a43; padding: 7px 9px; }.chip-list { display: grid; gap: 8px; }.chip-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 13px 0; border-bottom: 1px solid #edf1f5; }.chip-row strong, .chip-row span { display: block; }.chip-row span { color: #718096; margin-top: 4px; font-size: .85rem; }.empty-cell { text-align: center; color: #62748a; padding: 28px; }.success-text { color: #15803d; font-weight: 800; }.error-text { color: #b91c1c; font-weight: 800; }@media (max-width: 700px) { .page-header { align-items: start; flex-direction: column; }.panel { padding: 16px; } }
  `],
})
export class FeeManagementComponent implements OnInit {
  private readonly feeService = inject(FeeService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly lookup = inject(FeeLookupService);
  readonly tabs: { value: FeeTab; label: string }[] = [
    { value: 'years', label: 'Academic years' }, { value: 'categories', label: 'Categories' }, { value: 'terms', label: 'Terms' },
    { value: 'structures', label: 'Structures' }, { value: 'assignments', label: 'Assignments' }, { value: 'ledger', label: 'Ledger' }, { value: 'receipts', label: 'Receipts' },
  ];
  activeTab: FeeTab = 'years';
  academicYears: AcademicYear[] = [];
  categories: FeeCategory[] = [];
  terms: FeeTerm[] = [];
  structures: FeeStructure[] = [];
  assignments: FeeAssignment[] = [];
  ledger: StudentFeeLedger[] = [];
  receipts: { id: string; receiptNumber: string; studentId: string; amountPaid: number; receiptDate: string; remarks?: string }[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  editingYearId: string | null = null;
  editingCategoryId: string | null = null;
  editingTermId: string | null = null;
  editingStructureId: string | null = null;
  yearForm = { name: '', startDate: '', endDate: '', active: true };
  categoryForm = { name: '', description: '' };
  termForm: FeeTermRequest = { academicYearId: '', label: '', frequency: 'ANNUAL', startDate: '', endDate: '' };
  structureForm: FeeStructureRequest = { academicYearId: '', classId: '', feeCategoryId: '', feeTermId: '', amount: 0, dueDate: '' };
  receiptForm: FeeReceiptRequest = { ledgerEntryId: '', amountPaid: 0, receiptDate: new Date().toISOString().slice(0, 10), remarks: '' };
  assignmentForm = { feeStructureId: '', studentId: '', overrideAmount: undefined as number | undefined };
  classAssignmentForm = { feeStructureId: '', classId: '', overrideAmount: undefined as number | undefined };
  ledgerStatus = '';
  ledgerClassId = '';

  get selectedLedgerEntry(): StudentFeeLedger | undefined {
    return this.ledger.find((entry) => entry.id === this.receiptForm.ledgerEntryId);
  }

  get isOverpayment(): boolean {
    const entry = this.selectedLedgerEntry;
    return !!entry && this.receiptForm.amountPaid > entry.outstandingAmount;
  }

  ngOnInit(): void {
    this.loadAll();
    this.lookup.loadAll(this.authService.getTenantId() ?? '').subscribe({ next: () => this.refresh(), error: () => this.refresh() });
  }

  selectTab(tab: FeeTab): void { this.activeTab = tab; this.clearMessages(); if (tab === 'terms') this.loadTerms(); if (tab === 'structures') this.loadStructures(); if (tab === 'assignments') this.loadAssignments(); if (tab === 'ledger') this.loadLedger(); if (tab === 'receipts') { this.loadReceipts(); this.loadLedger(); } }

  saveAcademicYear(): void {
    if (this.yearForm.startDate && this.yearForm.endDate && this.yearForm.startDate >= this.yearForm.endDate) {
      this.errorMessage = 'Start date must be before end date.';
      return;
    }
    const request = { ...this.yearForm };
    const call = this.editingYearId ? this.feeService.updateAcademicYear(this.editingYearId, request) : this.feeService.createAcademicYear(request);
    call.subscribe({ next: () => { this.done('Academic year saved.'); this.resetYear(); this.loadAcademicYears(); }, error: (err) => this.fail(err) });
  }
  editYear(year: AcademicYear): void { this.editingYearId = year.id; this.yearForm = { name: year.name, startDate: year.startDate, endDate: year.endDate, active: year.active }; }
  deactivateYear(year: AcademicYear): void { if (!confirm(`Deactivate academic year ${year.name}?`)) return; this.feeService.deactivateAcademicYear(year.id).subscribe({ next: () => { this.done('Academic year deactivated.'); this.loadAcademicYears(); }, error: (err) => this.fail(err) }); }

  saveCategory(): void { const call = this.editingCategoryId ? this.feeService.updateFeeCategory(this.editingCategoryId, this.categoryForm) : this.feeService.createFeeCategory(this.categoryForm); call.subscribe({ next: () => { this.done('Category saved.'); this.resetCategory(); this.loadCategories(); }, error: (err) => this.fail(err) }); }
  editCategory(category: FeeCategory): void { this.editingCategoryId = category.id; this.categoryForm = { name: category.name, description: category.description || '' }; }
  deleteCategory(category: FeeCategory): void { if (!confirm(`Delete ${category.name}?`)) return; this.feeService.deleteFeeCategory(category.id).subscribe({ next: () => { this.done('Category deleted.'); this.loadCategories(); }, error: (err) => this.fail(err) }); }

  saveTerm(): void { const call = this.editingTermId ? this.feeService.updateFeeTerm(this.editingTermId, this.termForm) : this.feeService.createFeeTerm(this.termForm); call.subscribe({ next: () => { this.done('Term saved.'); this.resetTerm(); this.loadTerms(); }, error: (err) => this.fail(err) }); }
  editTerm(term: FeeTerm): void { this.editingTermId = term.id; this.termForm = { academicYearId: term.academicYearId, label: term.label, frequency: term.frequency, startDate: term.startDate || '', endDate: term.endDate || '' }; }

  saveStructure(): void { const call = this.editingStructureId ? this.feeService.updateFeeStructure(this.editingStructureId, this.structureForm) : this.feeService.createFeeStructure(this.structureForm); call.subscribe({ next: () => { this.done('Fee structure saved.'); this.resetStructure(); this.loadStructures(); }, error: (err) => this.fail(err) }); }
  editStructure(structure: FeeStructure): void { this.editingStructureId = structure.id; this.structureForm = { academicYearId: structure.academicYearId, classId: structure.classId, feeCategoryId: structure.feeCategoryId, feeTermId: structure.feeTermId, amount: structure.amount, dueDate: structure.dueDate }; }
  deleteStructure(structure: FeeStructure): void { if (!confirm('Delete this fee structure?')) return; this.feeService.deleteFeeStructure(structure.id).subscribe({ next: () => { this.done('Fee structure deleted.'); this.loadStructures(); }, error: (err) => this.fail(err) }); }

  saveReceipt(): void {
    if (this.isOverpayment) return;
    this.feeService.createReceipt(this.receiptForm).subscribe({ next: () => { this.done('Receipt generated.'); this.receiptForm = { ledgerEntryId: '', amountPaid: 0, receiptDate: new Date().toISOString().slice(0, 10), remarks: '' }; this.loadReceipts(); }, error: (err) => this.fail(err) });
  }
  assignFee(): void { this.feeService.assignToStudent(this.assignmentForm).subscribe({ next: () => { this.done('Fee assigned.'); this.assignmentForm = { feeStructureId: '', studentId: '', overrideAmount: undefined }; this.loadAssignments(); }, error: (err) => this.fail(err) }); }
  assignClassFee(): void { this.feeService.assignToClass(this.classAssignmentForm).subscribe({ next: () => { this.done('Fee assigned to class.'); this.classAssignmentForm = { feeStructureId: '', classId: '', overrideAmount: undefined }; this.loadAssignments(); }, error: (err) => this.fail(err) }); }
  deleteAssignment(assignment: FeeAssignment): void { if (!confirm('Remove this fee assignment?')) return; this.feeService.deleteAssignment(assignment.id).subscribe({ next: () => { this.done('Assignment removed.'); this.loadAssignments(); }, error: (err) => this.fail(err) }); }
  loadLedger(): void { this.feeService.getLedger({ status: this.ledgerStatus, classId: this.ledgerClassId }, 1, 40).subscribe({ next: (response) => { this.ledger = response.data; this.refresh(); }, error: (err) => this.fail(err) }); }
  loadReceipts(): void { this.feeService.getReceipts(undefined, 1, 40).subscribe({ next: (response) => { this.receipts = response.data; this.refresh(); }, error: (err) => this.fail(err) }); }
  loadAssignments(): void { this.feeService.getAssignments().subscribe({ next: (response) => { this.assignments = response.data || []; this.refresh(); }, error: (err) => this.fail(err) }); }

  private loadAll(): void { this.loadAcademicYears(); this.loadCategories(); this.loadTerms(); this.loadStructures(); }
  private loadAcademicYears(): void { this.feeService.getAcademicYears(1, 40).subscribe({ next: (response) => { this.academicYears = response.data; this.refresh(); }, error: (err) => this.fail(err) }); }
  private loadCategories(): void { this.feeService.getFeeCategories().subscribe({ next: (response) => { this.categories = response.data || []; this.refresh(); }, error: (err) => this.fail(err) }); }
  private loadTerms(): void { const yearId = this.termForm.academicYearId || this.academicYears[0]?.id; if (!yearId) return; this.termForm.academicYearId = yearId; this.feeService.getFeeTerms(yearId).subscribe({ next: (response) => { this.terms = response.data || []; this.refresh(); }, error: (err) => this.fail(err) }); }
  private loadStructures(): void { this.feeService.getFeeStructures({}, 1, 40).subscribe({ next: (response) => { this.structures = response.data; this.refresh(); }, error: (err) => this.fail(err) }); }
  private resetYear(): void { this.editingYearId = null; this.yearForm = { name: '', startDate: '', endDate: '', active: true }; }
  private resetCategory(): void { this.editingCategoryId = null; this.categoryForm = { name: '', description: '' }; }
  private resetTerm(): void { this.editingTermId = null; this.termForm = { academicYearId: this.academicYears[0]?.id || '', label: '', frequency: 'ANNUAL', startDate: '', endDate: '' }; }
  private resetStructure(): void { this.editingStructureId = null; this.structureForm = { academicYearId: '', classId: '', feeCategoryId: '', feeTermId: '', amount: 0, dueDate: '' }; }
  private done(message: string): void { this.successMessage = message; this.errorMessage = null; this.refresh(); }
  private fail(err: { error?: { message?: string }; message?: string }): void { this.errorMessage = err?.error?.message || err?.message || 'Fee API request failed.'; this.successMessage = null; this.refresh(); }
  private clearMessages(): void { this.successMessage = null; this.errorMessage = null; }
  private refresh(): void { this.cdr.detectChanges(); }
}
