export interface LeaveType {
  id: number;
  code: string;
  name: string;
  description?: string;
  maxDays?: number;
  isActive: boolean;
}
