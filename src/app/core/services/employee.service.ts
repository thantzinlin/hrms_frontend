import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Employee } from '../../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private api: ApiService) {}

  getAll(params: Record<string, string | number>): Observable<any> {
    return this.api.get<any>('employees', params);
  }

  get(id: string | number): Observable<Employee> {
    return this.api.get<Employee>(`employees/${id}`);
  }

  create(data: any): Observable<any> {
    return this.api.post('employees', data);
  }

  update(id: string | number, data: any): Observable<any> {
    return this.api.put(`employees/${id}`, data);
  }

  delete(id: string | number): Observable<any> {
    return this.api.delete(`employees/${id}`);
  }
}
