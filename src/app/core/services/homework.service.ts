import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../models/student.model';
import { HomeworkDto, HomeworkRequest } from '../models/homework.model';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api-config';

@Injectable({ providedIn: 'root' })
export class HomeworkService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private tenantId(): string {
    return this.authService.getTenantId() ?? '';
  }

  // NOTE: unlike every other paginated endpoint in this app, /api/teacher/homework uses 0-based paging.
  listForTeacher(teacherId: string, page = 0, limit = 20): Observable<PaginatedResponse<HomeworkDto>> {
    const params = new HttpParams()
      .set('tenantId', this.tenantId())
      .set('teacherId', teacherId)
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PaginatedResponse<HomeworkDto>>(`${API_BASE_URL}/api/teacher/homework`, { params });
  }

  create(request: HomeworkRequest): Observable<ApiResponse<HomeworkDto>> {
    const params = new HttpParams().set('tenantId', this.tenantId());
    const payload = { ...request, tenantId: this.tenantId() };
    return this.http.post<ApiResponse<HomeworkDto>>(`${API_BASE_URL}/api/teacher/homework`, payload, { params });
  }
}
