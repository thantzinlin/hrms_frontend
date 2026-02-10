import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgService } from '../../core/services/org.service';
import { HierarchyNode } from '../../models/hierarchy.model';
import { HierarchyNodeComponent } from './hierarchy-node.component';

@Component({
  selector: 'app-org-hierarchy',
  standalone: true,
  imports: [CommonModule, HierarchyNodeComponent],
  templateUrl: './org-hierarchy.component.html',
  styleUrls: ['./org-hierarchy.component.css']
})
export class OrgHierarchyComponent implements OnInit {
  roots: HierarchyNode[] = [];
  loading = false;
  error = '';

  constructor(
    private orgService: OrgService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHierarchy();
  }

  loadHierarchy(): void {
    this.loading = true;
    this.error = '';
    this.orgService.getHierarchy().subscribe({
      next: (data) => {
        this.roots = this.normalizeHierarchyData(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Failed to load hierarchy.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Accept array directly (after ApiService unwrap) or full response { data: [...] }. */
  private normalizeHierarchyData(data: unknown): HierarchyNode[] {
    if (Array.isArray(data)) return data as HierarchyNode[];
    if (data && typeof data === 'object' && 'data' in data) {
      const d = (data as { data: unknown }).data;
      return Array.isArray(d) ? (d as HierarchyNode[]) : [];
    }
    return [];
  }

  trackById(_index: number, item: HierarchyNode): number {
    return item.id;
  }
}
