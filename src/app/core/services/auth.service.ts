import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let currentUser = null;
    if (isPlatformBrowser(this.platformId)) {
      currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(currentUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    return from(
      fetch(`${environment.apiUrl}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw { status: response.status, message: data.message || 'Login failed' };
        }
        return data;
      })
    ).pipe(
      map((response: any) => {
        const token = response?.token ?? response?.accessToken ?? response?.access_token;
        if (response && token) {
          const user: User = {
            id: response.id ?? 0,
            username: response.username ?? username,
            email: response.email ?? '',
            roles: response.roles ?? [],
            token
          };
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        }
        return response;
      }),
      switchMap((response) =>
        new Observable((observer) => {
          this.ngZone.run(() => {
            observer.next(response);
            observer.complete();
          });
        })
      ),
      catchError((err) => throwError(() => err))
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<any> {
    return from(this.refreshTokenPromise()).pipe(catchError((err) => throwError(() => err)));
  }

  async refreshTokenPromise(): Promise<any> {
    const user = this.currentUserValue;
    if (!user || !user.token) {
      throw new Error('No current user or token to refresh');
    }

    const response = await fetch(`${environment.apiUrl}/auth/refreshtoken`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    if (!response.ok) {
      this.logout();
      throw { status: response.status, message: data.message || 'Token refresh failed' };
    }

    if (data && data.token) {
      const updatedUser: User = { ...user, token: data.token };
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      this.currentUserSubject.next(updatedUser);
    }
    return data;
  }

  public isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  public hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return !!(user && user.roles && user.roles.includes(role));
  }
}
