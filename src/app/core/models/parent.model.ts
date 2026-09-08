export interface CreateParentRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
  schoolId: string;
  tenantId: string;
}

export interface ParentUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roles: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string | null;
  code?: number | null;
}
