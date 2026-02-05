import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

const SIGNIN_URL = `${environment.apiUrl}/auth/signin`;
const REFRESH_URL = `${environment.apiUrl}/auth/refreshtoken`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.loadStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<unknown> {
    return this.http.post<unknown>(SIGNIN_URL, { username, password }).pipe(
      switchMap((data) => this.handleLoginResponse(data, username)),
      catchError((err) => throwError(() => this.normalizeError(err, 'Invalid username or password. Please try again.')))
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<unknown> {
    const user = this.currentUserValue;
    if (!user?.token) {
      return throwError(() => ({ message: 'No token to refresh' }));
    }
    return this.http
      .post<unknown>(REFRESH_URL, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .pipe(
        tap((data) => this.applyRefreshToken(data, user)),
        catchError((err) => {
          this.logout();
          return throwError(() => this.normalizeError(err, 'Session expired. Please sign in again.'));
        })
      );
  }

  isAuthenticated(): boolean {
    return this.currentUserValue != null;
  }

  hasRole(role: string): boolean {
    return !!this.currentUserValue?.roles?.includes(role);
  }

  private loadStoredUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private handleLoginResponse(data: unknown, username: string): Observable<unknown> {
    const body = (data ?? {}) as Record<string, unknown>;
    const returnCode = body['returnCode'] as string | undefined;
    const returnMessage = (body['returnMessage'] as string) ?? 'Login failed';

    if (returnCode && returnCode !== '200') {
      return throwError(() => ({ message: returnMessage, returnMessage }));
    }

    const payload = (body['data'] ?? body) as Record<string, unknown>;
    const token = (payload['token'] ?? payload['accessToken'] ?? payload['access_token'] ?? body['token'] ?? body['accessToken'] ?? body['access_token']) as string | undefined;

    if (!token) {
      return throwError(() => ({ message: returnMessage, returnMessage }));
    }

    const user: User = {
      id: ((payload['id'] ?? body['id']) as number) ?? 0,
      username: ((payload['username'] ?? body['username']) as string) ?? username,
      email: ((payload['email'] ?? body['email']) as string) ?? '',
      roles: ((payload['roles'] ?? body['roles']) as string[]) ?? [],
      token,
      employeeId: ((payload['employeeId'] ?? body['employeeId']) as string) ?? ''
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
    return of(data);
  }

  private applyRefreshToken(data: unknown, currentUser: User): void {
    const body = (data ?? {}) as Record<string, unknown>;
    const newToken = body['token'] as string | undefined;
    if (!newToken) return;
    const updated: User = { ...currentUser, token: newToken };
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
    this.currentUserSubject.next(updated);
  }

  private normalizeError(err: unknown, fallback: string): { message: string; returnMessage?: string } {
    const body = (err as { error?: unknown })?.error;
    const bodyObj = body != null && typeof body === 'object' ? (body as Record<string, unknown>) : null;
    const msg = (bodyObj?.['returnMessage'] ?? bodyObj?.['message']) as string | undefined;
    const message = msg ?? (err as { message?: string })?.message ?? fallback;
    return { message, returnMessage: msg ?? message };
  }
}
