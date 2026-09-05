import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../models/student.model';
import { NotificationDto } from '../models/notification.model';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api-config';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private tenantId(): string {
    return this.authService.getTenantId() ?? '';
  }

  listAdmin(page = 1, limit = 20): Observable<PaginatedResponse<NotificationDto>> {
    const params = new HttpParams().set('tenantId', this.tenantId()).set('page', page).set('limit', limit);
    return this.http.get<PaginatedResponse<NotificationDto>>(`${API_BASE_URL}/api/admin/notifications`, { params });
  }

  markAsRead(id: string): Observable<ApiResponse<NotificationDto>> {
    const params = new HttpParams().set('tenantId', this.tenantId());
    return this.http.patch<ApiResponse<NotificationDto>>(`${API_BASE_URL}/api/notifications/${id}/read`, {}, { params });
  }
}
