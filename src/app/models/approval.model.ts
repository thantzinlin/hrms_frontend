/** Request type for approval workflow */
export type RequestType = 'LEAVE' | 'OVERTIME';

/** Single item in pending approvals list (composite id e.g. LEAVE-1, OVERTIME-2) */
export interface PendingApprovalItem {
  id: string;
  requestType: RequestType;
  requestId: number;
  requesterEmployeeId: string;
  requesterName: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  leaveType?: string;
  hours?: number;
}

/** Body for approve/reject (optional remarks) */
export interface ApproveRejectBody {
  requestType?: RequestType;
  requestId?: number;
  remarks?: string;
}
