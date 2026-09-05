import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { ApiResponse, FeeCategory, FeeDashboard, FeeFilters, FeeReceipt, PaginatedResponse, StudentFeeLedger } from '../models/fee.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FeeService {
  private readonly baseUrl = `${API_BASE_URL}/api/admin/fee`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private params(values: Record<string, string | number | undefined>): HttpParams {
    let params = new HttpParams().set('tenantId', this.authService.getTenantId() ?? '');
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
      }
    }
    return params;
  }

  getDashboard(academicYearId?: string): Observable<ApiResponse<FeeDashboard>> {
    return this.http.get<ApiResponse<FeeDashboard>>(`${this.baseUrl}/dashboard`, { params: this.params({ academicYearId }) });
  }

  getLedger(filters: FeeFilters = {}, page = 1, limit = 20): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.baseUrl}/ledger`, { params: this.params({ ...filters, page, limit }) });
  }

  getReports(type: 'paid' | 'outstanding' | 'overdue', page = 1, limit = 20): Observable<PaginatedResponse<StudentFeeLedger>> {
    return this.http.get<PaginatedResponse<StudentFeeLedger>>(`${this.baseUrl}/reports/${type}`, { params: this.params({ page, limit }) });
  }

  getReceipts(studentId?: string, page = 1, limit = 10): Observable<PaginatedResponse<FeeReceipt>> {
    return this.http.get<PaginatedResponse<FeeReceipt>>(`${this.baseUrl}/receipts`, { params: this.params({ studentId, page, limit }) });
  }

  getCategories(): Observable<ApiResponse<FeeCategory[]>> {
    return this.http.get<ApiResponse<FeeCategory[]>>(`${this.baseUrl}/categories`, { params: this.params({}) });
  }

  createCategory(name: string, description?: string): Observable<ApiResponse<FeeCategory>> {
    return this.http.post<ApiResponse<FeeCategory>>(`${this.baseUrl}/categories`, { name, description }, { params: this.params({}) });
  }

  updateCategory(id: string, name: string, description?: string): Observable<ApiResponse<FeeCategory>> {
    return this.http.put<ApiResponse<FeeCategory>>(`${this.baseUrl}/categories/${id}`, { name, description }, { params: this.params({}) });
  }

  deleteCategory(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/categories/${id}`, { params: this.params({}) });
  }
}
