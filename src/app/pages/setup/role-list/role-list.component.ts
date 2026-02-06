import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../models/role.model';
import { MessageDialogService } from '../../../core/services/message-dialog.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
          this.loadRoles();
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
        this.loadRoles();
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
