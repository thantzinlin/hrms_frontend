import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    const url = this.buildUrl(path);
    const httpParams = this.buildParams(params);
    return this.http
      .get<T>(url, { params: httpParams, responseType: 'json' })
      .pipe(
        map((body) => this.unwrap<T>(body)),
        catchError((err) => throwError(() => this.normalizeError(err)))
      );
  }

  /** Get raw blob (e.g. for file download). Does not unwrap API response. */
  getBlob(path: string): Observable<Blob> {
    const url = this.buildUrl(path);
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.post<T>(url, body ?? {}).pipe(
      map((res) => this.unwrap<T>(res)),
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.put<T>(url, body ?? {}).pipe(
      map((res) => this.unwrap<T>(res)),
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  delete<T>(path: string): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.delete<T>(url).pipe(
      map((res) => this.unwrap<T>(res)),
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.patch<T>(url, body ?? {}).pipe(
      map((res) => this.unwrap<T>(res)),
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) return path;
    const clean = path.replace(/^\//, '');
    return `${this.baseUrl}/${clean}`;
  }

  private buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return httpParams;
  }

  private unwrap<T>(body: unknown): T {
    if (body == null) return body as T;
    const b = body as Record<string, unknown>;
    if (b['returnCode'] !== undefined && b['returnMessage'] !== undefined) {
      const code = b['returnCode'];
      if (code === '200' || code === 200) return (b['data'] ?? body) as T;
      throw {
        status: 0,
        message: (b['returnMessage'] as string) || `API Error: ${b['returnCode']}`,
        returnMessage: b['returnMessage']
      };
    }
    return body as T;
  }

  private normalizeError(err: unknown): {
    status?: number;
    message?: string;
    returnMessage?: string;
    data?: unknown;
  } {
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      const body = e['error'];
      const bodyObj = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
      const dataVal = bodyObj?.['data'];
      const dataMessage = typeof dataVal === 'string' && dataVal.trim() ? dataVal : null;
      const message =
        dataMessage ??
        (bodyObj?.['returnMessage'] as string) ??
        (e['message'] as string) ??
        (bodyObj?.['message'] as string) ??
        'Request failed';
      return {
        status: e['status'] as number,
        message,
        returnMessage: bodyObj?.['returnMessage'] as string,
        data: bodyObj?.['data']
      };
    }
    return { message: 'Request failed' };
  }
}
