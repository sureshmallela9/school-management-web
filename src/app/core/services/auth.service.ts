import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { UserDto } from '../models';
import { API_BASE_URL } from '../api-config';

interface AuthResponseUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  tenantId: string;
  school?: { id: string; name: string; code: string; address?: string };
}

interface AuthApiResponse {
  success: boolean;
  data: { accessToken: string; refreshToken: string; user: AuthResponseUser } | null;
  message: string;
  error: string | null;
  code: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'school-management.token';
  private readonly userKey = 'school-management.user';
  private readonly userSubject = new BehaviorSubject<UserDto | null>(this.getStoredUser());

  readonly currentUser$ = this.userSubject.asObservable();
  // reactive signal so components can react to login/logout without re-reading localStorage in a computed()
  readonly currentUserSignal = signal<UserDto | null>(this.getStoredUser());

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<AuthApiResponse>(`${API_BASE_URL}/api/auth/login`, { username: username.trim(), password }).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }
        return response.data;
      }),
      tap(({ accessToken, user }) => {
        const mappedUser: UserDto = {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId,
          schoolId: user.school?.id,
          // backend roles are sometimes plain ("ADMIN") and sometimes pre-prefixed ("ROLE_ADMIN") - normalize
          roles: user.roles.map((role) => (role.startsWith('ROLE_') ? role : `ROLE_${role}`)),
        };
        this.setToken(accessToken, mappedUser);
      }),
      map(({ accessToken }) => ({ token: accessToken })),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string, user?: UserDto): void {
    localStorage.setItem(this.tokenKey, token);
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.userSubject.next(user);
      this.currentUserSignal.set(user);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const exp = this.getTokenExpiry(token);
    return exp === null || exp > Math.floor(Date.now() / 1000);
  }

  getTenantId(): string | null {
    return this.getCurrentUser()?.tenantId ?? null;
  }

  getUserId(): string | null {
    return this.getCurrentUser()?.id ?? null;
  }

  getSchoolId(): string | null {
    return this.getCurrentUser()?.schoolId ?? null;
  }

  getRoles(): string[] {
    return this.getCurrentUser()?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  getCurrentUser(): UserDto | null {
    return this.userSubject.value ?? this.getStoredUser();
  }

  private getStoredUser(): UserDto | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserDto;
    } catch {
      return null;
    }
  }

  private getTokenExpiry(token: string): number | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  }
}

