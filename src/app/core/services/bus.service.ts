import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/student.model';
import { BusLocationDto } from '../models/bus.model';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api-config';

@Injectable({ providedIn: 'root' })
export class BusService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getLocation(busId: string): Observable<ApiResponse<BusLocationDto>> {
    const params = new HttpParams().set('tenantId', this.authService.getTenantId() ?? '');
    return this.http.get<ApiResponse<BusLocationDto>>(`${API_BASE_URL}/api/parent/bus-location/${busId}`, { params });
  }
}
