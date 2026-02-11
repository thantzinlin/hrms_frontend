import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ClaimType } from '../../models/claim-type.model';
import { PageParams, PageResponse } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimTypeService {
  private basePath = 'claim-types';

  constructor(private api: ApiService) {}

  getAll(): Observable<ClaimType[]> {
    return this.api.get<ClaimType[]>(this.basePath);
  }

  getPage(params?: PageParams): Observable<PageResponse<ClaimType>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'name,asc' }
      : { page: 0, size: 10, sort: 'name,asc' };
    return this.api.get<PageResponse<ClaimType>>(this.basePath, p as Record<string, string | number>);
  }

  getActive(): Observable<ClaimType[]> {
    return this.api.get<ClaimType[]>(`${this.basePath}/active`);
  }

  getById(id: number): Observable<ClaimType> {
    return this.api.get<ClaimType>(`${this.basePath}/${id}`);
  }

  create(data: Partial<ClaimType>): Observable<ClaimType> {
    return this.api.post<ClaimType>(this.basePath, data);
  }

  update(id: number, data: Partial<ClaimType>): Observable<ClaimType> {
    return this.api.put<ClaimType>(`${this.basePath}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
