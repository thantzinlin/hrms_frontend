import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  post<T>(path: string, body?: any): Observable<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  put<T>(path: string, body?: any): Observable<T> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  delete<T>(path: string): Observable<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  patch<T>(path: string, body?: any): Observable<T> {
    return this.request<T>(path, { method: 'PATCH', body });
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(path.startsWith('http') ? path : `${this.baseUrl}/${path.replace(/^\//, '')}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async fetchWithRetry(
    url: string,
    config: RequestConfig,
    isRetry = false
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    if (!config.skipAuth) {
      const user = this.authService.currentUserValue;
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }

    const fetchOptions: RequestInit = {
      method: config.method || 'GET',
      headers,
      credentials: 'omit'
    };

    if (config.body && config.method !== 'GET') {
      fetchOptions.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, fetchOptions);

    if (response.status === 401 && !isRetry && !config.skipAuth) {
      if (!this.isRefreshing && isPlatformBrowser(this.platformId)) {
        this.isRefreshing = true;
        try {
          await this.authService.refreshTokenPromise();
          return this.fetchWithRetry(url, config, true);
        } catch {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        } finally {
          this.isRefreshing = false;
        }
      }
    }

    return response;
  }

  private request<T>(path: string, config: RequestConfig = {}): Observable<T> {
    const url = this.buildUrl(path, config.params);

    return from(this.fetchWithRetry(url, config)).pipe(
      switchMap(async (response) => {
        const text = await response.text();
        let responseBody: any = null;

        try {
          responseBody = text ? JSON.parse(text) : null;
        } catch (e) {
          // If parsing fails, treat text as raw response or empty
          responseBody = null;
        }


        if (!response.ok) {
          // Handle HTTP errors (e.g., 404, 500)
          let errorMessage = `HTTP ${response.status}`;
          if (responseBody && responseBody.returnMessage) {
            errorMessage = responseBody.returnMessage;
          } else if (responseBody && (responseBody.message || responseBody.error)) {
            errorMessage = responseBody.message || responseBody.error;
          } else if (text) {
            errorMessage = text;
          }
          throw { status: response.status, message: errorMessage };
        }

        // Handle successful HTTP responses (2xx)
        // Check for the new response format (returnCode, returnMessage, data)
        if (responseBody && responseBody.returnCode && responseBody.returnMessage) {
          if (responseBody.returnCode === '200') {
            return responseBody.data;
          } else {
            // This case handles API-specific errors even if HTTP status is 200 (e.g., business logic errors)
            throw { status: response.status, message: responseBody.returnMessage || `API Error: ${responseBody.returnCode}` };
          }
        }

        // If not in the new structured format, return the whole body as before
        return responseBody;
      }),
      catchError((err) => throwError(() => err))
    ) as Observable<T>;
  }
}
