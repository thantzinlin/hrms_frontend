/** Request type for approval workflow */
export type RequestType = 'LEAVE' | 'OVERTIME' | 'CLAIM';

/** Single item in pending approvals list (composite id e.g. LEAVE-1, OVERTIME-2, CLAIM-3) */
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
  /** Claim: total amount */
  amount?: number;
  /** Claim: claim type name */
  claimType?: string;
}

/** Body for approve/reject (optional remarks) */
export interface ApproveRejectBody {
  requestType?: RequestType;
  requestId?: number;
  remarks?: string;
}
