import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { DepartmentService } from '../../core/services/department.service';
import { MessageDialogService } from '../../core/services/message-dialog.service';
import { Department } from '../../models/department.model';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = true;
  error = '';
  showForm = false;
  editingId: number | null = null;
  formLoading = false;
  departmentForm: FormGroup;
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  sort = 'id,asc';
  pageSizeOptions = [10, 20, 50];
  sortOptions: SortOption[] = [
    { value: 'id,asc', label: 'ID (asc)' },
    { value: 'id,desc', label: 'ID (desc)' },
    { value: 'name,asc', label: 'Name (A–Z)' },
    { value: 'name,desc', label: 'Name (Z–A)' }
  ];

  constructor(
    private departmentService: DepartmentService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(page?: number): void {
    if (page !== undefined) this.page = page;
    this.loading = true;
    this.error = '';
    this.departmentService
      .getAllDepartments({ page: this.page, size: this.size, sort: this.sort })
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
            this.departments = Array.isArray(r.content) ? r.content as Department[] : [];
            this.totalPages = r.totalPages ?? 0;
            this.totalElements = r.totalElements ?? this.departments.length;
          } else {
            this.departments = Array.isArray(data) ? data as Department[] : [];
            this.totalPages = 0;
            this.totalElements = this.departments.length;
          }
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load departments.';
          this.departments = [];
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  prevPage(): void {
    if (this.page > 0) this.loadDepartments(this.page - 1);
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) this.loadDepartments(this.page + 1);
  }

  onPageChange(page: number): void {
    this.loadDepartments(page);
  }

  onPageSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.loadDepartments(0);
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.loadDepartments(0);
  }

  openAdd(): void {
    this.editingId = null;
    this.departmentForm.reset({ name: '' });
    this.showForm = true;
  }

  openEdit(department: Department): void {
    if (department.id == null) return;
    this.editingId = department.id;
    this.departmentForm.patchValue({ name: department.name });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.departmentForm.reset({ name: '' });
  }

  save(): void {
    if (this.departmentForm.invalid) return;
    this.formLoading = true;
    const value = this.departmentForm.value;

    const obs =
      this.editingId != null
        ? this.departmentService.updateDepartment(this.editingId, { id: this.editingId, name: value.name })
        : this.departmentService.createDepartment({ name: value.name } as Department);
    obs
      .pipe(finalize(() => (this.formLoading = false)))
      .subscribe({
        next: () => {
          this.loadDepartments(this.page);
          this.cancelForm();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Save failed.';
          this.messageDialog.showApiError(err);
        }
      });
  }

  deleteDepartment(department: Department): void {
    if (department.id == null) return;
    if (!confirm(`Delete department "${department.name}"?`)) return;
    this.departmentService.deleteDepartment(department.id).subscribe({
      next: () => this.loadDepartments(this.page),
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  get f() {
    return this.departmentForm.controls;
  }
}
