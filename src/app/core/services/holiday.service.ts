import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Holiday } from '../../models/holiday.model';
import { PageParams, PageResponse } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private basePath = 'admin/holidays';

  constructor(private api: ApiService) {}

  /** For admin: list all holidays (paginated or full). */
  getAll(): Observable<Holiday[]> {
    return this.api.get<Holiday[]>(this.basePath);
  }

  /** For employees: read-only list of company holidays (no admin path). */
  getForEmployees(): Observable<Holiday[]> {
    return this.api.get<Holiday[]>('holidays');
  }

  getPage(params?: PageParams): Observable<PageResponse<Holiday>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'date,asc' }
      : { page: 0, size: 10, sort: 'date,asc' };
    return this.api.get<PageResponse<Holiday>>(this.basePath, p as Record<string, string | number>);
  }

  getById(id: number): Observable<Holiday> {
    return this.api.get<Holiday>(`${this.basePath}/${id}`);
  }

  create(holiday: Holiday): Observable<Holiday> {
    return this.api.post<Holiday>(this.basePath, holiday);
  }

  update(id: number, holiday: Holiday): Observable<Holiday> {
    return this.api.put<Holiday>(`${this.basePath}/${id}`, holiday);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
