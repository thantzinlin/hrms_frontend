import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Claim } from '../../models/claim.model';
import { ClaimType } from '../../models/claim-type.model';
import { PageParams, PageResponse } from '../../models/pagination.model';

export interface CreateClaimPayload {
  claimTypeId: number;
  claimDate: string;
  amount: number;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private basePath = 'claims';

  constructor(private api: ApiService) {}

  getTypes(): Observable<ClaimType[]> {
    return this.api.get<ClaimType[]>(`${this.basePath}/types`);
  }

  create(data: CreateClaimPayload): Observable<Claim> {
    return this.api.post<Claim>(this.basePath, data);
  }

  submit(id: number): Observable<Claim> {
    return this.api.post<Claim>(`${this.basePath}/${id}/submit`, {});
  }

  getById(id: number): Observable<Claim> {
    return this.api.get<Claim>(`${this.basePath}/${id}`);
  }

  getMyClaims(params?: PageParams): Observable<PageResponse<Claim>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'claimDate,desc' }
      : { page: 0, size: 10, sort: 'claimDate,desc' };
    return this.api.get<PageResponse<Claim>>(`${this.basePath}/my-claims`, p as Record<string, string | number>);
  }

  getByEmployee(employeeId: string, params?: PageParams): Observable<PageResponse<Claim>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'claimDate,desc' }
      : { page: 0, size: 10, sort: 'claimDate,desc' };
    return this.api.get<PageResponse<Claim>>(`${this.basePath}/employee/${employeeId}`, p as Record<string, string | number>);
  }

  getPending(params?: PageParams): Observable<PageResponse<Claim>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'claimDate,desc' }
      : { page: 0, size: 10, sort: 'claimDate,desc' };
    return this.api.get<PageResponse<Claim>>(`${this.basePath}/pending`, p as Record<string, string | number>);
  }

  /** Upload attachment - use FormData with multipart. */
  addAttachment(claimId: number, file: File, attachmentType?: string): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    if (attachmentType) formData.append('attachmentType', attachmentType);
    return this.api.post<unknown>(`${this.basePath}/${claimId}/attachments`, formData);
  }

  deleteAttachment(claimId: number, attachmentId: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${claimId}/attachments/${attachmentId}`);
  }

  /** Download attachment as blob (caller triggers save). */
  downloadAttachment(claimId: number, attachmentId: number): Observable<Blob> {
    return this.api.getBlob(`${this.basePath}/${claimId}/attachments/${attachmentId}/download`);
  }
}
