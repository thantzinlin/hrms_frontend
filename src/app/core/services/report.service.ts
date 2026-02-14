import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  AttendanceReportRow,
  LeaveReportRow,
  OvertimeReportRow,
  ClaimReportRow,
  EmployeeSummaryRow
} from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private basePath = 'reports';

  constructor(private api: ApiService) {}

  private buildExportParams(startDate?: string, endDate?: string, departmentId?: number): Record<string, string | number> {
    const params: Record<string, string | number> = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    if (departmentId != null) params['departmentId'] = departmentId;
    return params;
  }

  getAttendanceReport(startDate: string, endDate: string, departmentId?: number): Observable<AttendanceReportRow[]> {
    const params: Record<string, string | number> = { startDate, endDate };
    if (departmentId != null) params['departmentId'] = departmentId;
    return this.api.get<AttendanceReportRow[]>(`${this.basePath}/attendance`, params);
  }

  getLeaveReport(startDate: string, endDate: string, departmentId?: number): Observable<LeaveReportRow[]> {
    const params: Record<string, string | number> = { startDate, endDate };
    if (departmentId != null) params['departmentId'] = departmentId;
    return this.api.get<LeaveReportRow[]>(`${this.basePath}/leave`, params);
  }

  getOvertimeReport(startDate: string, endDate: string, departmentId?: number): Observable<OvertimeReportRow[]> {
    const params: Record<string, string | number> = { startDate, endDate };
    if (departmentId != null) params['departmentId'] = departmentId;
    return this.api.get<OvertimeReportRow[]>(`${this.basePath}/overtime`, params);
  }

  getClaimReport(startDate: string, endDate: string, departmentId?: number): Observable<ClaimReportRow[]> {
    const params: Record<string, string | number> = { startDate, endDate };
    if (departmentId != null) params['departmentId'] = departmentId;
    return this.api.get<ClaimReportRow[]>(`${this.basePath}/claim`, params);
  }

  getEmployeeSummaryReport(departmentId?: number): Observable<EmployeeSummaryRow[]> {
    const params: Record<string, string | number> = {};
    if (departmentId != null) params['departmentId'] = departmentId;
    return this.api.get<EmployeeSummaryRow[]>(`${this.basePath}/employee-summary`, params);
  }

  /** Export report as Excel. Returns Observable that completes when download is triggered. */
  exportExcel(
    reportType: 'attendance' | 'leave' | 'overtime' | 'claim' | 'employee-summary',
    startDate?: string,
    endDate?: string,
    departmentId?: number
  ): Observable<Blob> {
    const params = this.buildExportParams(startDate, endDate, departmentId) as Record<string, string | number | boolean>;
    const path = `${this.basePath}/${reportType}/export/excel`;
    return this.api.getBlob(path, params);
  }

  /** Export report as PDF. Returns Observable that completes when download is triggered. */
  exportPdf(
    reportType: 'attendance' | 'leave' | 'overtime' | 'claim' | 'employee-summary',
    startDate?: string,
    endDate?: string,
    departmentId?: number
  ): Observable<Blob> {
    const params = this.buildExportParams(startDate, endDate, departmentId) as Record<string, string | number | boolean>;
    const path = `${this.basePath}/${reportType}/export/pdf`;
    return this.api.getBlob(path, params);
  }
}
