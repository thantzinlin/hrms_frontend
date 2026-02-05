import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Holiday } from '../../models/holiday.model';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private basePath = 'admin/holidays';

  constructor(private api: ApiService) {}

  getAll(): Observable<Holiday[]> {
    return this.api.get<Holiday[]>(this.basePath);
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
