import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { RoleService } from '../../../core/services/role.service';
import { AdminMenuService } from '../../../core/services/admin-menu.service';
import { Role } from '../../../models/role.model';
import { AdminMenu } from '../../../models/admin-menu.model';
import { MessageDialogService } from '../../../core/services/message-dialog.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';

export interface MenuDisplayItem {
  menu: AdminMenu;
  depth: number;
}

@Component({
  selector: 'app-role-menu-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './role-menu-mapping.component.html',
  styleUrls: ['./role-menu-mapping.component.css']
})
export class RoleMenuMappingComponent implements OnInit {
  roles: Role[] = [];
  menus: AdminMenu[] = [];
  menuDisplayList: MenuDisplayItem[] = [];
  selectedRoleId: number | null = null;
  selectedMenuIds = new Set<number>();
  loading = false;
  loadingMenus = false;
  saving = false;
  error = '';

  constructor(
    private roleService: RoleService,
    private adminMenuService: AdminMenuService,
    private messageDialog: MessageDialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadMenus();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = '';
    this.roleService
      .getAll()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.roles = Array.isArray(data) ? data : [];
          this.error = '';
          if (this.selectedRoleId == null && this.roles.length > 0) {
            const firstId = this.roleId(this.roles[0]);
            if (firstId != null) this.selectRole(firstId);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load roles.';
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  loadMenus(): void {
    this.loadingMenus = true;
    this.adminMenuService
      .getFlat()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loadingMenus = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.menus = Array.isArray(data) ? data : [];
          this.menuDisplayList = this.buildMenuDisplayList(this.menus);
          this.cdr.detectChanges();
        },
        error: () => {
          this.menus = [];
          this.menuDisplayList = [];
          this.cdr.detectChanges();
        }
      });
  }

  /** Build tree from flat list, then flatten to display list with depth for indentation. */
  buildMenuDisplayList(flat: AdminMenu[]): MenuDisplayItem[] {
    const tree = this.buildMenuTree(flat);
    return this.flattenMenuTree(tree, 0);
  }

  private buildMenuTree(flat: AdminMenu[]): AdminMenu[] {
    const byId = new Map<number, AdminMenu>();
    flat.forEach((m) => {
      const id = this.menuId(m);
      if (id != null) byId.set(id, { ...m, children: [] });
    });
    const roots: AdminMenu[] = [];
    byId.forEach((node) => {
      const parentId = node.parentId ?? null;
      if (parentId == null || !byId.has(parentId)) {
        roots.push(node);
      } else {
        const parent = byId.get(parentId);
        if (parent) {
          parent.children = parent.children ?? [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });
    roots.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    byId.forEach((node) => {
      if (node.children?.length) node.children.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    });
    return roots;
  }

  private flattenMenuTree(nodes: AdminMenu[], depth: number): MenuDisplayItem[] {
    const result: MenuDisplayItem[] = [];
    nodes.forEach((menu) => {
      result.push({ menu, depth });
      if (menu.children?.length) result.push(...this.flattenMenuTree(menu.children, depth + 1));
    });
    return result;
  }

  /** Recursively collect all menuId values from a tree (API returns menus with nested children). */
  private collectMenuIdsFromTree(nodes: { menuId?: number; children?: unknown[] }[]): number[] {
    const ids: number[] = [];
    nodes.forEach((node) => {
      if (node.menuId != null) ids.push(node.menuId);
      if (Array.isArray(node.children) && node.children.length) {
        ids.push(...this.collectMenuIdsFromTree(node.children as { menuId?: number; children?: unknown[] }[]));
      }
    });
    return ids;
  }

  onRoleChange(value: number | null): void {
    if (value == null) {
      this.selectedRoleId = null;
      this.selectedMenuIds.clear();
      this.cdr.detectChanges();
      return;
    }
    this.selectRole(value);
  }

  selectRole(roleId: number): void {
    this.selectedRoleId = roleId;
    this.selectedMenuIds.clear();
    this.loading = true;
    this.roleService
      .getMenusByRoleId(roleId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          const raw = Array.isArray(data) ? data : [];
          const first = raw[0];
          if (first != null && typeof first === 'object' && 'menuId' in first) {
            this.selectedMenuIds = new Set(
              this.collectMenuIdsFromTree(raw as { menuId?: number; children?: unknown[] }[])
            );
          } else {
            this.selectedMenuIds = new Set(raw.filter((id): id is number => typeof id === 'number'));
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.selectedMenuIds = new Set();
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load role menus.';
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  toggleMenu(menuId: number): void {
    if (this.selectedMenuIds.has(menuId)) {
      this.selectedMenuIds.delete(menuId);
    } else {
      this.selectedMenuIds.add(menuId);
    }
    this.selectedMenuIds = new Set(this.selectedMenuIds);
    this.cdr.detectChanges();
  }

  isSelected(menuId: number): boolean {
    return this.selectedMenuIds.has(menuId);
  }

  selectAll(): void {
    this.menus.forEach((m) => {
      const id = m.menuId ?? (m as { id?: number }).id;
      if (id != null) this.selectedMenuIds.add(id);
    });
    this.selectedMenuIds = new Set(this.selectedMenuIds);
    this.cdr.detectChanges();
  }

  clearAll(): void {
    this.selectedMenuIds.clear();
    this.cdr.detectChanges();
  }

  save(): void {
    if (this.selectedRoleId == null) return;
    this.saving = true;
    this.error = '';
    const menuIds = Array.from(this.selectedMenuIds);
    this.roleService
      .assignMenusToRole(this.selectedRoleId, menuIds)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.messageDialog.showSuccess('Menus assigned to role successfully.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to assign menus.';
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  roleId(r: Role): number | undefined {
    return r.id ?? (r as { roleId?: number }).roleId;
  }

  roleName(r: Role): string {
    return r.roleName ?? (r as { roleName?: string }).roleName ?? '';
  }

  menuId(m: AdminMenu): number | undefined {
    return m.menuId ?? (m as { id?: number }).id;
  }

  menuName(m: AdminMenu): string {
    return m.menuName ?? '';
  }
}
