import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { JwtPayload, UserDto } from '../models';
import { API_BASE_URL } from '../api-config';

interface AuthApiResponse {
  success: boolean;
  data: { accessToken: string; user: { id: string; name: string; email: string; tenantId: string; roles: string[] } } | null;
  message: string;
  error: string | null;
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

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<AuthApiResponse>(`${API_BASE_URL}/api/auth/login`, { username: email.trim(), password }).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }
        const user: UserDto = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          tenantId: response.data.user.tenantId,
          roles: response.data.user.roles.map((role) => role.startsWith('ROLE_') ? role : `ROLE_${role}`),
        };
        return { token: response.data.accessToken, user };
      }),
      tap(({ token, user }) => this.setToken(token, user)),
      map(({ token }) => ({ token })),
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

    const payload = this.parseToken(token);
    if (!payload.exp) {
      return true;
    }

    return payload.exp > Math.floor(Date.now() / 1000);
  }

  getTenantId(): string | null {
    return this.getCurrentUser()?.tenantId ?? this.parseToken(this.getToken() ?? '').tenantId ?? null;
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.parseToken(token).userId ?? null;
  }

  getRoles(): string[] {
    const roles = this.getCurrentUser()?.roles ?? this.parseToken(this.getToken() ?? '').roles ?? [];
    return roles.map((role) => role.startsWith('ROLE_') ? role : `ROLE_${role}`);
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

  private parseToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length < 2) {
      return { sub: '', roles: [] };
    }

    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload as JwtPayload;
    } catch {
      return { sub: '', roles: [] };
    }
  }

}
