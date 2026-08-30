export interface Student {
  id: string;
  tenantId: string;
  name: string;
  rollNumber: string;
  classId: string;
  parentId: string;
  admissionNumber: string;
  className?: string;
  section?: string;
  parentName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
}

export type CreateStudentRequest = Omit<Student, 'id' | 'tenantId'> & {
  tenantId?: string;
};

export type UpdateStudentRequest = Omit<Student, 'id' | 'tenantId'>;

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string | null;
  code?: number | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
