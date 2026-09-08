import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, Student, CreateStudentRequest, UpdateStudentRequest } from '../models/student.model';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api-config';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private getTenantId(): string {
    return this.authService.getTenantId() ?? 'tenant-001';
  }

  getStudents(tenantId: string, page = 1, limit = 10, searchTerm?: string): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams()
      .set('tenantId', tenantId || this.getTenantId())
      .set('page', page)
      .set('limit', limit);
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PaginatedResponse<Student>>(`${API_BASE_URL}/api/admin/students`, { params });
  }

  getStudentById(id: string, tenantId: string): Observable<ApiResponse<Student>> {
    const params = new HttpParams().set('tenantId', tenantId || this.getTenantId());
    return this.http.get<ApiResponse<Student>>(`${API_BASE_URL}/api/admin/students/${id}`, { params });
  }

  createStudent(student: CreateStudentRequest): Observable<ApiResponse<Student>> {
    const payload = { ...student, tenantId: student.tenantId ?? this.getTenantId() };
    return this.http.post<ApiResponse<Student>>(`${API_BASE_URL}/api/admin/students`, payload);
  }

  updateStudent(id: string, student: UpdateStudentRequest, tenantId: string): Observable<ApiResponse<Student>> {
    const params = new HttpParams().set('tenantId', tenantId || this.getTenantId());
    return this.http.put<ApiResponse<Student>>(`${API_BASE_URL}/api/admin/students/${id}`, student, { params });
  }

  deleteStudent(id: string, tenantId: string): Observable<ApiResponse<null>> {
    const params = new HttpParams().set('tenantId', tenantId || this.getTenantId());
    return this.http.delete<ApiResponse<null>>(`${API_BASE_URL}/api/admin/students/${id}`, { params });
  }

  getMyStudents(tenantId: string, page = 1, limit = 10): Observable<PaginatedResponse<Student>> {
    const params = new HttpParams()
      .set('tenantId', tenantId || this.getTenantId())
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PaginatedResponse<Student>>(`${API_BASE_URL}/api/parent/my-students`, { params });
  }
}

