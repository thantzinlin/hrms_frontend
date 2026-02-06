import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { RoleService } from '../../../core/services/role.service';
import { AdminMenuService } from '../../../core/services/admin-menu.service';
import { Role } from '../../../models/role.model';
import { AdminMenu } from '../../../models/admin-menu.model';
import { MessageDialogService } from '../../../core/services/message-dialog.service';

@Component({
  selector: 'app-role-menu-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-menu-mapping.component.html',
  styleUrls: ['./role-menu-mapping.component.css']
})
export class RoleMenuMappingComponent implements OnInit {
  roles: Role[] = [];
  menus: AdminMenu[] = [];
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
          this.cdr.detectChanges();
        },
        error: () => {
          this.menus = [];
          this.cdr.detectChanges();
        }
      });
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
              (raw as { menuId?: number }[]).map((m) => m.menuId).filter((id): id is number => id != null)
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
