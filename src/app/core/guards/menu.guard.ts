import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { MenuService } from '../services/menu.service';

/**
 * Guard that allows access only if the current path is in the user's menu (role-based).
 * If menus are not yet loaded, allows access (layout will load menus).
 */
export const menuGuard: CanActivateFn = (route, state) => {
  const menuService = inject(MenuService);
  const router = inject(Router);

  const path = state.url.split('?')[0].replace(/^\//, '') || '';
  const allowed = menuService.isPathAllowed(path);

  if (allowed) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
