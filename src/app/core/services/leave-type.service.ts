import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LeaveType } from '../../models/leave-type.model';
import { PageParams, PageResponse } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {
  private basePath = 'admin/leave-types';

  constructor(private api: ApiService) {}

  getAll(): Observable<LeaveType[]> {
    return this.api.get<LeaveType[]>(this.basePath);
  }

  getPage(params?: PageParams): Observable<PageResponse<LeaveType>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'name,asc' }
      : { page: 0, size: 10, sort: 'name,asc' };
    return this.api.get<PageResponse<LeaveType>>(this.basePath, p as Record<string, string | number>);
  }

  getActive(): Observable<LeaveType[]> {
    return this.api.get<LeaveType[]>(`${this.basePath}/active`);
  }

  getById(id: number): Observable<LeaveType> {
    return this.api.get<LeaveType>(`${this.basePath}/${id}`);
  }

  create(data: Partial<LeaveType>): Observable<LeaveType> {
    return this.api.post<LeaveType>(this.basePath, data);
  }

  update(id: number, data: Partial<LeaveType>): Observable<LeaveType> {
    return this.api.put<LeaveType>(`${this.basePath}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
