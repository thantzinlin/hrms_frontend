import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PendingApprovalItem, ApproveRejectBody } from '../../models/approval.model';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  constructor(private api: ApiService) {}

  /** Pending items for current user (as supervisor or HR). */
  getPending(): Observable<PendingApprovalItem[]> {
    return this.api.get<PendingApprovalItem[]>('approvals/pending');
  }

  /** Approve by composite id (e.g. LEAVE-1, OVERTIME-2). Optional body with remarks. */
  approveById(id: string, body?: ApproveRejectBody): Observable<unknown> {
    return this.api.post<unknown>(`approvals/${encodeURIComponent(id)}/approve`, body ?? {});
  }

  /** Reject by composite id. Optional body with remarks. */
  rejectById(id: string, body?: ApproveRejectBody): Observable<unknown> {
    return this.api.post<unknown>(`approvals/${encodeURIComponent(id)}/reject`, body ?? {});
  }

  /** Approve with full body (requestType, requestId, remarks). */
  approve(body: Required<Pick<ApproveRejectBody, 'requestType' | 'requestId'>> & { remarks?: string }): Observable<unknown> {
    return this.api.post<unknown>('approvals/approve', body);
  }

  /** Reject with full body. */
  reject(body: Required<Pick<ApproveRejectBody, 'requestType' | 'requestId'>> & { remarks?: string }): Observable<unknown> {
    return this.api.post<unknown>('approvals/reject', body);
  }
}
