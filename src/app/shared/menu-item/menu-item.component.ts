import {
  Component,
  Input,
  signal,
  inject,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from '../../models/menu.model';
import { MenuIconComponent } from './menu-icon.component';

/**
 * Recursive menu item: renders a link or an expandable parent with children.
 * Handles url: null (no navigation), active route highlight, and multi-level nesting.
 */
@Component({
  selector: 'app-menu-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MenuIconComponent, MenuItemComponent],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.css']
})
export class MenuItemComponent implements OnChanges {
  @Input({ required: true }) item!: MenuItem;
  @Input() depth = 0;

  expanded = signal(false);
  private readonly router = inject(Router);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item && this.hasChildren && this.isActiveOrChildActive) {
      this.expanded.set(true);
    }
  }

  get hasChildren(): boolean {
    return Array.isArray(this.item.children) && this.item.children.length > 0;
  }

  get isLink(): boolean {
    return !this.hasChildren && this.item.url != null && this.item.url !== '';
  }

  get linkUrl(): string | null {
    if (!this.item.url) return null;
    const path = this.item.url.startsWith('/') ? this.item.url : `/${this.item.url}`;
    // Treat /dashboard as same as / for app default route
    if (path === '/dashboard') return '/';
    return path;
  }

  toggle(): void {
    if (this.hasChildren) {
      this.expanded.update((v) => !v);
    }
  }

  /** True if current URL matches this item or any descendant. */
  get isActiveOrChildActive(): boolean {
    const url = this.linkUrl;
    if (url) {
      const current = this.router.url.split('?')[0];
      if (url === '/' && current === '/') return true;
      if (url !== '/' && current === url) return true;
      if (url !== '/' && current.startsWith(url + '/')) return true;
    }
    if (this.hasChildren) {
      return this.item.children.some((c: MenuItem) => this.childPathActive(c));
    }
    return false;
  }

  private childPathActive(child: MenuItem): boolean {
    if (child.url) {
      const path = child.url.startsWith('/') ? child.url : `/${child.url}`;
      const current = this.router.url.split('?')[0];
      if (path !== '/' && (current === path || current.startsWith(path + '/'))) return true;
    }
    if (child.children?.length) {
      return child.children.some((c: MenuItem) => this.childPathActive(c));
    }
    return false;
  }
}
