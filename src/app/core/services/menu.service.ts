import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { MenuItem } from '../../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);

  /** Raw menu tree from API (role-filtered by backend) */
  private readonly menusSignal = signal<MenuItem[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  /** Sorted by sequence for display */
  readonly menus = computed(() => {
    const items = this.menusSignal();
    return this.sortBySequence(items);
  });

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {
    // Clear menus on logout
    this.authService.currentUser?.subscribe((user) => {
      if (!user) {
        this.clearMenus();
      }
    });
  }

  /**
   * Fetch menus from API. Call after successful login or when layout loads with existing session.
   */
  fetchMenus(): Observable<MenuItem[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.api.get<MenuItem[]>('menus').pipe(
      tap((data) => {
        const list = Array.isArray(data) ? data : [];
        this.menusSignal.set(list);
        this.loadingSignal.set(false);
      }),
      catchError((err) => {
        const message =
          err?.message ?? (typeof err === 'string' ? err : 'Failed to load menu');
        this.errorSignal.set(message);
        this.loadingSignal.set(false);
        this.menusSignal.set([]);
        return of([]);
      })
    );
  }

  /** Clear menu state (e.g. on logout). */
  clearMenus(): void {
    this.menusSignal.set([]);
    this.errorSignal.set(null);
  }

  /**
   * All route paths present in the menu tree (for route guard).
   * Includes only non-null urls, flattened from root and children.
   */
  getAllowedPaths(): string[] {
    const paths: string[] = [];
    const visit = (items: MenuItem[]) => {
      for (const item of items) {
        if (item.url) {
          paths.push(item.url.replace(/^\//, '') || '');
        }
        if (item.children?.length) {
          visit(item.children);
        }
      }
    };
    visit(this.menusSignal());
    return paths;
  }

  /** Check if a path is allowed by the current menu (path without leading slash). */
  isPathAllowed(path: string): boolean {
    const normalized = path.replace(/^\//, '') || '';
    const allowed = this.getAllowedPaths();
    if (allowed.length === 0) return true; // No menu yet: allow (guard may defer)
    // Treat '' (home) and 'dashboard' as equivalent for default dashboard route
    const homeAllowed = allowed.includes('') || allowed.includes('dashboard');
    if (normalized === '' || normalized === 'dashboard') return homeAllowed;
    return allowed.some((p) => p === normalized || normalized.startsWith(p + '/'));
  }

  private sortBySequence(items: MenuItem[]): MenuItem[] {
    if (!items?.length) return [];
    const sorted = [...items].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    return sorted.map((item) => ({
      ...item,
      children: item.children?.length ? this.sortBySequence(item.children) : []
    }));
  }
}
