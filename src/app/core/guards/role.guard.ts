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

  return router.createUrlTree(['/app/home']);
};

@Injectable({ providedIn: 'root' })
export class RoleGuard {
  canActivate: CanActivateFn = roleGuard;
}
