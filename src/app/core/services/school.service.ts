import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { School } from '../models/school.model';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api-config';

@Injectable({ providedIn: 'root' })
export class SchoolService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  search(name?: string, code?: string): Observable<School[]> {
    let params = new HttpParams().set('tenantId', this.authService.getTenantId() ?? '');
    if (name) {
      params = params.set('name', name);
    }
    if (code) {
      params = params.set('code', code);
    }
    return this.http.get<School[]>(`${API_BASE_URL}/schools`, { params });
  }
}
