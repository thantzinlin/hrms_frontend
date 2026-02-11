import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Department } from '../../models/department.model';
import { PageParams, PageResponse } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private basePath = 'admin/departments';

  constructor(private api: ApiService) {}

  /** Get departments with optional pagination. Without params returns first page (default size). */
  getAllDepartments(params?: PageParams): Observable<PageResponse<Department>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'id,asc' }
      : { page: 0, size: 100, sort: 'id,asc' };
    return this.api.get<PageResponse<Department>>(this.basePath, p as Record<string, string | number>);
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.api.get<Department>(`${this.basePath}/${id}`);
  }

  createDepartment(department: Department): Observable<Department> {
    return this.api.post<Department>(this.basePath, department);
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.api.put<Department>(`${this.basePath}/${id}`, department);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.api.delete(`${this.basePath}/${id}`);
  }
}
