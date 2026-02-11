import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../models/role.model';
import { MessageDialogService } from '../../../core/services/message-dialog.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = true;
  error = '';
  showForm = false;
  editingId: number | null = null;
  formLoading = false;
  roleForm: FormGroup;
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  sort = 'roleId,asc';
  pageSizeOptions = [10, 20, 50];
  sortOptions: SortOption[] = [
    { value: 'roleId,asc', label: 'ID (asc)' },
    { value: 'roleId,desc', label: 'ID (desc)' },
    { value: 'roleName,asc', label: 'Role name (A–Z)' },
    { value: 'roleName,desc', label: 'Role name (Z–A)' }
  ];

  constructor(
    private roleService: RoleService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(page?: number): void {
    if (page !== undefined) this.page = page;
    this.loading = true;
    this.error = '';
    this.roleService
      .getPage({ page: this.page, size: this.size, sort: this.sort })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          const raw = data && typeof data === 'object' && 'content' in data ? data : null;
          if (raw && typeof raw === 'object') {
            const r = raw as { content?: unknown; totalPages?: number; totalElements?: number };
            this.roles = Array.isArray(r.content) ? r.content as Role[] : [];
            this.totalPages = r.totalPages ?? 0;
            this.totalElements = r.totalElements ?? this.roles.length;
          } else {
            this.roles = Array.isArray(data) ? data as Role[] : [];
            this.totalPages = 0;
            this.totalElements = this.roles.length;
          }
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load roles.';
          this.roles = [];
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(page: number): void {
    this.loadRoles(page);
  }

  onPageSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.loadRoles(0);
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.loadRoles(0);
  }

  openAdd(): void {
    this.editingId = null;
    this.roleForm.reset({ roleName: '', description: '' });
    this.showForm = true;
  }

  openEdit(role: Role): void {
    const id = role.id ?? (role as { roleId?: number }).roleId;
    if (id == null) return;
    this.editingId = id;
    this.roleForm.patchValue({
      roleName: role.roleName ?? (role as { roleName?: string }).roleName ?? '',
      description: role.description ?? ''
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.roleForm.reset({ roleName: '', description: '' });
  }

  save(): void {
    if (this.roleForm.invalid) return;
    this.formLoading = true;
    const value = this.roleForm.value;
    const payload: Role = { roleName: value.roleName, description: value.description ?? '' };

    const obs =
      this.editingId != null
        ? this.roleService.update(this.editingId, { ...payload, id: this.editingId })
        : this.roleService.create(payload);
    obs
      .pipe(finalize(() => (this.formLoading = false)))
      .subscribe({
        next: () => {
          this.loadRoles(this.page);
          this.cancelForm();
          this.messageDialog.showSuccess('Role saved successfully.');
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Save failed.';
          this.messageDialog.showApiError(err);
        }
      });
  }

  deleteRole(role: Role): void {
    const id = role.id ?? (role as { roleId?: number }).roleId;
    if (id == null) return;
    const name = role.roleName ?? (role as { roleName?: string }).roleName ?? 'this role';
    if (!confirm(`Delete role "${name}"?`)) return;
    this.roleService.delete(id).subscribe({
      next: () => {
        this.loadRoles(this.page);
        this.messageDialog.showSuccess('Role deleted.');
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  get f() {
    return this.roleForm.controls;
  }

  roleId(r: Role): number | undefined {
    return r.id ?? (r as { roleId?: number }).roleId;
  }

  roleName(r: Role): string {
    return r.roleName ?? (r as { roleName?: string }).roleName ?? '';
  }
}
