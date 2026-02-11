import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PageParams, PageResponse } from '../../models/pagination.model';
import { Overtime } from '../../models/overtime.model';

@Injectable({
  providedIn: 'root'
})
export class OvertimeService {
  constructor(private api: ApiService) {}

  create(data: any): Observable<any> {
    return this.api.post('overtime', data);
  }

  getAll(params?: PageParams): Observable<PageResponse<Overtime>> {
    const p = params ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'date,desc' } : { page: 0, size: 10, sort: 'date,desc' };
    return this.api.get<PageResponse<Overtime>>('overtime', p as Record<string, string | number>);
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`overtime/${id}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.put(`overtime/${id}/status`, { status });
  }

  getByEmployee(employeeId: string, params?: PageParams): Observable<PageResponse<Overtime>> {
    const p = params ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'date,desc' } : { page: 0, size: 10, sort: 'date,desc' };
    return this.api.get<PageResponse<Overtime>>(`overtime/employee/${employeeId}`, p as Record<string, string | number>);
  }

  getPending(params?: PageParams): Observable<PageResponse<Overtime>> {
    const p = params ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'date,desc' } : { page: 0, size: 10, sort: 'date,desc' };
    return this.api.get<PageResponse<Overtime>>('overtime/pending', p as Record<string, string | number>);
  }
}
