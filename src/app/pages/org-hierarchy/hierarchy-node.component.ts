import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HierarchyNode } from '../../models/hierarchy.model';

@Component({
  selector: 'app-hierarchy-node',
  standalone: true,
  imports: [CommonModule, forwardRef(() => HierarchyNodeComponent)],
  templateUrl: './hierarchy-node.component.html',
  styleUrls: ['./org-hierarchy.component.css']
})
export class HierarchyNodeComponent {
  @Input({ required: true }) node!: HierarchyNode;
  @Input() depth = 0;

  get hasSubordinates(): boolean {
    return this.node != null && Array.isArray(this.node.subordinates) && this.node.subordinates.length > 0;
  }

  trackById(_index: number, item: HierarchyNode): number {
    return item.id;
  }
}
