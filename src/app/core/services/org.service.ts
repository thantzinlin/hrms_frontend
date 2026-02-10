import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HierarchyNode } from '../../models/hierarchy.model';

@Injectable({
  providedIn: 'root'
})
export class OrgService {
  constructor(private api: ApiService) {}

  getHierarchy(): Observable<HierarchyNode[]> {
    return this.api.get<HierarchyNode[]>('org/hierarchy');
  }
}
