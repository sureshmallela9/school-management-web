import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CreateParentRequest, ParentUser } from '../models/parent.model';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api-config';

@Injectable({ providedIn: 'root' })
export class ParentService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  createParent(request: Omit<CreateParentRequest, 'tenantId' | 'schoolId'> & { tenantId?: string; schoolId?: string }): Observable<ApiResponse<ParentUser>> {
    const payload: CreateParentRequest = {
      ...request,
      tenantId: request.tenantId ?? this.authService.getTenantId() ?? '',
      schoolId: request.schoolId ?? this.authService.getSchoolId() ?? '',
    };
    return this.http.post<ApiResponse<ParentUser>>(`${API_BASE_URL}/api/admin/parents`, payload);
  }
}
