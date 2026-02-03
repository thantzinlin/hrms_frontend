import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  constructor(private api: ApiService) {}

  create(data: any): Observable<any> {
    return this.api.post('leaves', data);
  }

  getAll(): Observable<any> {
    return this.api.get<any>('leaves');
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`leaves/${id}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.put(`leaves/${id}/status`, { status });
  }

  getByEmployee(employeeId: number): Observable<any> {
    return this.api.get<any>(`leaves/employee/${employeeId}`);
  }

  getPending(): Observable<any> {
    return this.api.get<any>('leaves/pending');
  }
}
