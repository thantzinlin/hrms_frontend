import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Position } from '../../models/position.model';
import { PageParams, PageResponse } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private basePath = 'positions';

  constructor(private api: ApiService) {}

  getAll(): Observable<Position[]> {
    return this.api.get<Position[]>(this.basePath);
  }

  /** Paginated list for position-list page. */
  getPage(params?: PageParams): Observable<PageResponse<Position>> {
    const p = params
      ? { page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? 'positionId,asc' }
      : { page: 0, size: 10, sort: 'positionId,asc' };
    return this.api.get<PageResponse<Position>>(this.basePath, p as Record<string, string | number>);
  }

  getById(id: number): Observable<Position> {
    return this.api.get<Position>(`${this.basePath}/${id}`);
  }

  create(position: Position): Observable<Position> {
    return this.api.post<Position>(this.basePath, position);
  }

  update(id: number, position: Position): Observable<Position> {
    return this.api.put<Position>(`${this.basePath}/${id}`, position);
  }

  delete(id: number): Observable<unknown> {
    return this.api.delete(`${this.basePath}/${id}`);
  }
}
