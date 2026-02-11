/** Leave status: PENDING_SUPERVISOR | PENDING_HR | APPROVED | REJECTED */
export type LeaveStatus = 'PENDING_SUPERVISOR' | 'PENDING_HR' | 'APPROVED' | 'REJECTED';

export interface Leave {
  id: number;
  employeeId: number;
  employeeName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  /** @deprecated Use leaveTypeName for display */
  leaveType?: string;
  leaveTypeId?: number;
  leaveTypeCode?: string;
  leaveTypeName?: string;
  status: LeaveStatus | string;
}
