import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { AdminMenuService } from '../../../core/services/admin-menu.service';
import { AdminMenu } from '../../../models/admin-menu.model';
import { MessageDialogService } from '../../../core/services/message-dialog.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {
  menus: AdminMenu[] = [];
  flatMenus: AdminMenu[] = [];
  loading = true;
  error = '';
  showForm = false;
  editingId: number | null = null;
  formLoading = false;
  menuForm: FormGroup;
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  sort = 'sequence,asc';
  pageSizeOptions = [10, 20, 50];
  sortOptions: SortOption[] = [
    { value: 'sequence,asc', label: 'Sequence (asc)' },
    { value: 'sequence,desc', label: 'Sequence (desc)' },
    { value: 'menuId,asc', label: 'ID (asc)' },
    { value: 'menuId,desc', label: 'ID (desc)' },
    { value: 'menuName,asc', label: 'Name (A–Z)' },
    { value: 'menuName,desc', label: 'Name (Z–A)' }
  ];

  constructor(
    private adminMenuService: AdminMenuService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.menuForm = this.fb.group({
      menuName: ['', Validators.required],
      moduleCode: ['HRMS', Validators.required],
      parentId: [null as number | null],
      url: [''],
      icon: [''],
      sequence: [1, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(page?: number): void {
    if (page !== undefined) this.page = page;
    this.loading = true;
    this.error = '';
    this.adminMenuService
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
            this.menus = Array.isArray(r.content) ? r.content as AdminMenu[] : [];
            this.totalPages = r.totalPages ?? 0;
            this.totalElements = r.totalElements ?? this.menus.length;
          } else {
            this.menus = Array.isArray(data) ? data as AdminMenu[] : [];
            this.totalPages = 0;
            this.totalElements = this.menus.length;
          }
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load menus.';
          this.menus = [];
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
    this.adminMenuService.getFlat().subscribe({
      next: (data) => (this.flatMenus = Array.isArray(data) ? data : [])
    });
  }

  onPageChange(page: number): void {
    this.loadMenus(page);
  }

  onPageSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.loadMenus(0);
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.loadMenus(0);
  }

  openAdd(): void {
    this.editingId = null;
    this.menuForm.reset({
      menuName: '',
      moduleCode: 'HRMS',
      parentId: null,
      url: '',
      icon: '',
      sequence: 1
    });
    this.showForm = true;
  }

  openEdit(menu: AdminMenu): void {
    const id = menu.menuId ?? (menu as { id?: number }).id;
    if (id == null) return;
    this.editingId = id;
    this.menuForm.patchValue({
      menuName: menu.menuName ?? '',
      moduleCode: menu.moduleCode ?? 'HRMS',
      parentId: menu.parentId ?? null,
      url: menu.url ?? '',
      icon: menu.icon ?? '',
      sequence: menu.sequence ?? 1
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  save(): void {
    if (this.menuForm.invalid) return;
    this.formLoading = true;
    const value = this.menuForm.value;
    const payload: AdminMenu = {
      menuName: value.menuName,
      moduleCode: value.moduleCode,
      parentId: value.parentId || null,
      url: value.url || null,
      icon: value.icon || undefined,
      sequence: value.sequence ?? 1
    };

    const obs =
      this.editingId != null
        ? this.adminMenuService.update(this.editingId, { ...payload, menuId: this.editingId })
        : this.adminMenuService.create(payload);
    obs
      .pipe(finalize(() => (this.formLoading = false)))
      .subscribe({
        next: () => {
          this.loadMenus(this.page);
          this.cancelForm();
          this.messageDialog.showSuccess('Menu saved successfully.');
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Save failed.';
          this.messageDialog.showApiError(err);
        }
      });
  }

  deleteMenu(menu: AdminMenu): void {
    const id = menu.menuId ?? (menu as { id?: number }).id;
    if (id == null) return;
    const name = menu.menuName ?? 'this menu';
    if (!confirm(`Delete menu "${name}"?`)) return;
    this.adminMenuService.delete(id).subscribe({
      next: () => {
        this.loadMenus(this.page);
        this.messageDialog.showSuccess('Menu deleted.');
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  get f() {
    return this.menuForm.controls;
  }

  menuId(m: AdminMenu): number | undefined {
    return m.menuId ?? (m as { id?: number }).id;
  }

  menuName(m: AdminMenu): string {
    return m.menuName ?? '';
  }

  /** Flatten tree for table display (one row per menu, displayName for indentation). When using pagination, menus are already flat. */
  get flatList(): (AdminMenu & { displayName?: string })[] {
    const out: (AdminMenu & { displayName?: string })[] = [];
    const visit = (items: AdminMenu[], depth: number) => {
      for (const item of items) {
        out.push({ ...item, displayName: '  '.repeat(depth) + (item.menuName ?? '') });
        if (item.children?.length) visit(item.children, depth + 1);
      }
    };
    visit(this.menus, 0);
    return out;
  }
}
