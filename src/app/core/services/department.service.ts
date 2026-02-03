import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Department } from '../../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private basePath = 'admin/departments';

  constructor(private api: ApiService) {}

  getAllDepartments(): Observable<Department[]> {
    return this.api.get<Department[]>(this.basePath);
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
