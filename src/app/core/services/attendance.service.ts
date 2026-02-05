import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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
    employeeId: String,
    startDate: string,
    endDate: string
  ): Observable<any> {
    return this.api.get<any>(`attendance/report/employee/${employeeId}`, {
      startDate,
      endDate
    });
  }

  getAttendanceByDate(date: string): Observable<any> {
    return this.api.get<any>(`attendance/report/date/${date}`);
  }
}
