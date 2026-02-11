import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AdminMenu } from '../../models/admin-menu.model';
import { PageParams, PageResponse } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class AdminMenuService {
  private basePath = 'admin/menus';

  constructor(private api: ApiService) {}

  getAll(): Observable<AdminMenu[]> {
    return this.api.get<AdminMenu[]>(this.basePath);
  }

  getPage(params?: PageParams): Observable<PageResponse<AdminMenu>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'sequence,asc' }
      : { page: 0, size: 10, sort: 'sequence,asc' };
    return this.api.get<PageResponse<AdminMenu>>(this.basePath, p as Record<string, string | number>);
  }

  getFlat(): Observable<AdminMenu[]> {
    return this.api.get<AdminMenu[]>(`${this.basePath}/flat`);
  }

  getById(id: number): Observable<AdminMenu> {
    return this.api.get<AdminMenu>(`${this.basePath}/${id}`);
  }

  create(menu: AdminMenu): Observable<AdminMenu> {
    return this.api.post<AdminMenu>(this.basePath, menu);
  }

  update(id: number, menu: AdminMenu): Observable<AdminMenu> {
    return this.api.put<AdminMenu>(`${this.basePath}/${id}`, menu);
  }

  delete(id: number): Observable<unknown> {
    return this.api.delete(`${this.basePath}/${id}`);
  }
}
