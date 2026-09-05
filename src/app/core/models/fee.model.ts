import { ApiResponse, PaginatedResponse } from './student.model';

export interface StudentFeeLedger {
  id: string;
  studentId: string;
  feeAssignmentId: string;
  feeStructureId: string;
  academicYearId: string;
  classId: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeReceipt {
  id: string;
  receiptNumber: string;
  ledgerEntryId: string;
  studentId: string;
  amountPaid: number;
  receiptDate: string;
  remarks: string | null;
  tenantId: string;
  createdAt: string;
}

export interface FeeDashboard {
  totalAssigned: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
  recentReceipts: FeeReceipt[];
  monthlySummary: { month: string; collectedAmount: number }[];
}

export interface FeeFilters {
  status?: string;
  classId?: string;
  academicYearId?: string;
}

export interface FeeCategory {
  id: string;
  name: string;
  description: string | null;
  deleted: boolean;
  tenantId: string;
}

export type { ApiResponse, PaginatedResponse };
