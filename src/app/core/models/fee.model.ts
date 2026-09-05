import { ApiResponse, PaginatedResponse } from './student.model';

export interface StudentFeeLedger {
  id: string;
  studentId: string;
  feeAssignmentId?: string;
  feeStructureId?: string;
  academicYearId?: string;
  classId?: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeReceipt {
  id: string;
  receiptNumber: string;
  ledgerEntryId: string;
  studentId: string;
  amountPaid: number;
  receiptDate: string;
  remarks?: string;
  tenantId: string;
  createdAt?: string;
}

export interface LegacyFee {
  id: string;
  studentId: string;
  studentName?: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  receiptNumber?: string;
  paymentMethod?: string;
  tenantId: string;
}

export interface FeeDashboard {
  totalAssigned: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
  recentReceipts: FeeReceipt[];
  monthlySummary: { month: string; collectedAmount: number }[];
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  tenantId: string;
}

export interface FeeCategory {
  id: string;
  name: string;
  description?: string;
  deleted?: boolean;
  tenantId: string;
}

export interface FeeTerm {
  id: string;
  academicYearId: string;
  label: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  tenantId: string;
}

export interface FeeStructure {
  id: string;
  academicYearId: string;
  classId: string;
  feeCategoryId: string;
  feeTermId: string;
  amount: number;
  dueDate: string;
  tenantId: string;
}

export interface FeeAssignment {
  id: string;
  feeStructureId: string;
  assignmentType: string;
  classId?: string;
  studentId?: string;
  overrideAmount?: number;
  tenantId: string;
}

export interface AcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
  active?: boolean;
}

export interface FeeCategoryRequest {
  name: string;
  description?: string;
}

export interface FeeTermRequest {
  academicYearId: string;
  label: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
}

export interface FeeStructureRequest {
  academicYearId: string;
  classId: string;
  feeCategoryId: string;
  feeTermId: string;
  amount: number;
  dueDate: string;
}

export interface StudentFeeAssignmentRequest {
  feeStructureId: string;
  studentId: string;
  overrideAmount?: number;
}

export interface ClassFeeAssignmentRequest {
  feeStructureId: string;
  classId: string;
  overrideAmount?: number;
}

export interface FeeReceiptRequest {
  ledgerEntryId: string;
  amountPaid: number;
  receiptDate: string;
  remarks?: string;
}

export interface FeeFilters {
  status?: string;
  classId?: string;
  academicYearId?: string;
}

export type { ApiResponse, PaginatedResponse };
