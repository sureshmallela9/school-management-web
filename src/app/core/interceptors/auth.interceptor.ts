import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../api-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isPublicAuthRequest = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/forgot-password') || req.url.includes('/api/auth/verify-otp');

  if (!token || !req.url.startsWith(API_BASE_URL) || isPublicAuthRequest) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
