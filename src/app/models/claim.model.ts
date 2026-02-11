export type ClaimStatus =
  | 'DRAFT'
  | 'PENDING_SUPERVISOR'
  | 'PENDING_HR'
  | 'APPROVED'
  | 'REJECTED'
  | 'REIMBURSED';

export interface ClaimAttachment {
  id: number;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  attachmentType?: string;
  downloadUrl?: string;
}

export interface Claim {
  id: number;
  claimNumber: string;
  employeeId?: number;
  employeeName?: string;
  employeeEmployeeId?: string;
  claimTypeId: number;
  claimTypeCode?: string;
  claimTypeName?: string;
  totalAmount: number;
  currency: string;
  claimDate: string;
  description?: string;
  status: ClaimStatus | string;
  submittedAt?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectionRemarks?: string;
  attachments?: ClaimAttachment[];
}
