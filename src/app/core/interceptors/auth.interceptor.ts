import { HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
let isRefreshing = false;

/**
 * Adds Bearer token to outgoing requests (except auth endpoints).
 * On 401, attempts token refresh and retries the request once.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const skipAuth =
    req.url.includes('/auth/signin') ||
    req.url.includes('/auth/refreshtoken');

  let authReq = req;
  if (!skipAuth) {
    const token = auth.currentUserValue?.token;
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isRefreshRequest = req.url.includes('/auth/refreshtoken');
      if (err.status !== 401 || skipAuth || isRefreshing || isRefreshRequest) {
        return throwError(() => err);
      }

      isRefreshing = true;
      return auth.refreshToken().pipe(
        switchMap(() => {
          isRefreshing = false;
          const newToken = auth.currentUserValue?.token;
          const retryReq = newToken
            ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
            : req;
          return next(retryReq);
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          auth.logout();
          // Defer redirect so navigation runs outside the request teardown and avoids injector errors (e.g. MenuService undefined)
          setTimeout(() => {
            router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          }, 0);
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
