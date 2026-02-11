import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PageParams, PageResponse } from '../../models/pagination.model';
import { Attendance } from '../../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private api: ApiService) {}

  checkIn(employeeId: number): Observable<any> {
    return this.api.post('attendance/check-in', { employeeId });
  }

  checkOut(attendanceId: number): Observable<any> {
    return this.api.post('attendance/check-out', { attendanceId });
  }

  getAttendanceByEmployeeAndDateRange(
    employeeId: string,
    startDate: string,
    endDate: string,
    params?: PageParams
  ): Observable<PageResponse<Attendance>> {
    const p = {
      startDate,
      endDate,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'date,desc'
    };
    return this.api.get<PageResponse<Attendance>>(`attendance/report/employee/${employeeId}`, p as Record<string, string | number>);
  }

  getAttendanceByDate(date: string): Observable<any> {
    return this.api.get<any>(`attendance/report/date/${date}`);
  }
}
