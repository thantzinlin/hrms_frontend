import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Position } from '../../models/position.model';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private basePath = 'positions';

  constructor(private api: ApiService) {}

  getAll(): Observable<Position[]> {
    return this.api.get<Position[]>(this.basePath);
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
