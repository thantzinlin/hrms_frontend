import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LeaveType } from '../../models/leave-type.model';
import { PageParams, PageResponse } from '../../models/pagination.model';
import { Leave } from '../../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  constructor(private api: ApiService) {}

  getTypes(): Observable<LeaveType[]> {
    return this.api.get<LeaveType[]>('leaves/types');
  }

  create(data: any): Observable<any> {
    return this.api.post('leaves', data);
  }

  getAll(params?: PageParams): Observable<PageResponse<Leave>> {
    const p = params ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'startDate,desc' } : { page: 0, size: 10, sort: 'startDate,desc' };
    return this.api.get<PageResponse<Leave>>('leaves', p as Record<string, string | number>);
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`leaves/${id}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.put(`leaves/${id}/status`, { status });
  }

  getByEmployee(employeeId: string, params?: PageParams): Observable<PageResponse<Leave>> {
    const p = params ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'startDate,desc' } : { page: 0, size: 10, sort: 'startDate,desc' };
    return this.api.get<PageResponse<Leave>>(`leaves/employee/${employeeId}`, p as Record<string, string | number>);
  }

  getPending(params?: PageParams): Observable<PageResponse<Leave>> {
    const p = params ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'startDate,desc' } : { page: 0, size: 10, sort: 'startDate,desc' };
    return this.api.get<PageResponse<Leave>>('leaves/pending', p as Record<string, string | number>);
  }

  calculateLeaveDays(id: number): Observable<any> {
    return this.api.get<any>(`leaves/${id}/calculate-days`);
  }
}
