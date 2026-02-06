export interface Leave {
  id: number;
  employeeId: number;
  employeeName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  status: string;
}
