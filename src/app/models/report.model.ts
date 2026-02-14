export interface AttendanceReportRow {
  attendanceId?: number;
  employeeId?: string;
  employeeName?: string;
  departmentName?: string;
  date?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workedHours?: number;
}

export interface LeaveReportRow {
  leaveRequestId?: number;
  employeeId?: string;
  employeeName?: string;
  departmentName?: string;
  leaveTypeName?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  reason?: string;
}

export interface OvertimeReportRow {
  overtimeRequestId?: number;
  employeeId?: string;
  employeeName?: string;
  departmentName?: string;
  date?: string;
  hours?: number;
  status?: string;
  reason?: string;
}

export interface ClaimReportRow {
  claimId?: number;
  claimNumber?: string;
  employeeId?: string;
  employeeName?: string;
  departmentName?: string;
  claimTypeName?: string;
  claimDate?: string;
  totalAmount?: number;
  currency?: string;
  status?: string;
  description?: string;
}

export interface EmployeeSummaryRow {
  employeeId?: number;
  employeeCode?: string;
  employeeName?: string;
  email?: string;
  departmentName?: string;
  positionName?: string;
  status?: string;
  joinDate?: string;
}

export type ReportType = 'attendance' | 'leave' | 'overtime' | 'claim' | 'employee-summary';
