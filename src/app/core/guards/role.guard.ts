import { Injectable } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[] | undefined;
  const hasAccess = requiredRoles ? requiredRoles.some((role) => authService.hasRole(role)) : true;

  if (hasAccess) {
    return true;
  }

  if (authService.hasRole('ROLE_ADMIN') || authService.hasRole('ROLE_SUPERADMIN')) {
    return router.createUrlTree(['/admin/tenants']);
  }
  if (authService.hasRole('ROLE_TEACHER')) {
    return router.createUrlTree(['/teacher/home']);
  }
  if (authService.hasRole('ROLE_PARENT')) {
    return router.createUrlTree(['/app/home']);
  }

  return router.createUrlTree(['/auth/login']);
};

@Injectable({ providedIn: 'root' })
export class RoleGuard {
  canActivate: CanActivateFn = roleGuard;
}
