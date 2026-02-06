import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OvertimeService {
  constructor(private api: ApiService) {}

  create(data: any): Observable<any> {
    return this.api.post('overtime', data);
  }

  getAll(): Observable<any> {
    return this.api.get<any>('overtime');
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`overtime/${id}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.put(`overtime/${id}/status`, { status });
  }

  getByEmployee(employeeId: string): Observable<any> {
    return this.api.get<any>(`overtime/employee/${employeeId}`);
  }

  getPending(): Observable<any> {
    return this.api.get<any>('overtime/pending');
  }
}
