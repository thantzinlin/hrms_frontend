/** Leave status: PENDING_SUPERVISOR | PENDING_HR | APPROVED | REJECTED */
export type LeaveStatus = 'PENDING_SUPERVISOR' | 'PENDING_HR' | 'APPROVED' | 'REJECTED';

export interface Leave {
  id: number;
  employeeId: number;
  employeeName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  status: LeaveStatus | string;
}
