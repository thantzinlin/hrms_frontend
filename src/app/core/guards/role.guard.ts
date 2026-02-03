import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = route.data['expectedRoles'] as string[] | undefined;
  const currentUser = authService.currentUserValue;

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  if (!expectedRoles?.length) {
    return true;
  }

  const hasRole = expectedRoles.some((role: string) => currentUser.roles?.includes(role));
  if (hasRole) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
