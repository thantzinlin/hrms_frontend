import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getAll(params: Record<string, string | number>): Observable<any> {
    return this.api.get<any>('users', params);
  }
}
