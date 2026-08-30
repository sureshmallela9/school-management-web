import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { JwtPayload, UserDto } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'school-management.token';
  private readonly userKey = 'school-management.user';
  private readonly userSubject = new BehaviorSubject<UserDto | null>(this.getStoredUser());

  readonly currentUser$ = this.userSubject.asObservable();
  // reactive signal so components can react to login/logout without re-reading localStorage in a computed()
  readonly currentUserSignal = signal<UserDto | null>(this.getStoredUser());

  login(email: string, password: string): Observable<{ token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const role = normalizedEmail.includes('admin')
      ? 'ROLE_ADMIN'
      : normalizedEmail.includes('teacher')
        ? 'ROLE_TEACHER'
        : 'ROLE_PARENT';

    const user: UserDto = {
      id: `user-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`,
      name: normalizedEmail.includes('admin') ? 'School Admin' : normalizedEmail.includes('teacher') ? 'Teacher User' : 'Parent User',
      email: normalizedEmail,
      tenantId: 'tenant-001',
      roles: [role, 'ROLE_PARENT'].includes('ROLE_PARENT') && role !== 'ROLE_PARENT' ? [role] : [role],
    };

    const payload: JwtPayload = {
      sub: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
      userId: user.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    };

    const token = this.encodeToken(payload);
    this.setToken(token, user);
    return of({ token });
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
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.parseToken(token).tenantId ?? null;
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.parseToken(token).userId ?? null;
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }
    return this.parseToken(token).roles ?? [];
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

  private encodeToken(payload: JwtPayload): string {
    const encodedHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    return `${encodedHeader}.${encodedPayload}.signature`;
  }
}
