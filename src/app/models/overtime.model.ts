/** Overtime status: PENDING_SUPERVISOR | PENDING_HR | APPROVED | REJECTED */
export type OvertimeStatus = 'PENDING_SUPERVISOR' | 'PENDING_HR' | 'APPROVED' | 'REJECTED';

export interface Overtime {
  id: number;
  employeeId: string | number;
  employeeName?: string;
  date: string;
  hours: number;
  reason: string;
  status: OvertimeStatus | string;
}
