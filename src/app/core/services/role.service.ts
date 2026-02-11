import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Role } from '../../models/role.model';
import { PageParams, PageResponse } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private basePath = 'admin/roles';

  constructor(private api: ApiService) {}

  getAll(): Observable<Role[]> {
    return this.api.get<Role[]>(this.basePath);
  }

  getPage(params?: PageParams): Observable<PageResponse<Role>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'roleId,asc' }
      : { page: 0, size: 10, sort: 'roleId,asc' };
    return this.api.get<PageResponse<Role>>(this.basePath, p as Record<string, string | number>);
  }

  getById(id: number): Observable<Role> {
    return this.api.get<Role>(`${this.basePath}/${id}`);
  }

  create(role: Role): Observable<Role> {
    return this.api.post<Role>(this.basePath, role);
  }

  update(id: number, role: Role): Observable<Role> {
    return this.api.put<Role>(`${this.basePath}/${id}`, role);
  }

  delete(id: number): Observable<unknown> {
    return this.api.delete(`${this.basePath}/${id}`);
  }

  getMenusByRoleId(roleId: number): Observable<number[]> {
    return this.api.get<number[]>(`${this.basePath}/${roleId}/menus`);
  }

  assignMenusToRole(roleId: number, menuIds: number[]): Observable<unknown> {
    return this.api.put<unknown>(`${this.basePath}/${roleId}/menus`, { menuIds });
  }
}
