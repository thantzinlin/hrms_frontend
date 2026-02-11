import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { LeaveTypeService } from '../../../core/services/leave-type.service';
import { LeaveType } from '../../../models/leave-type.model';
import { MessageDialogService } from '../../../core/services/message-dialog.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-leave-type-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './leave-type-list.component.html',
  styleUrls: ['./leave-type-list.component.css']
})
export class LeaveTypeListComponent implements OnInit {
  leaveTypes: LeaveType[] = [];
  loading = true;
  error = '';
  showForm = false;
  editingId: number | null = null;
  formLoading = false;
  form: FormGroup;
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  sort = 'name,asc';
  pageSizeOptions = [10, 20, 50];
  sortOptions: SortOption[] = [
    { value: 'name,asc', label: 'Name (A–Z)' },
    { value: 'name,desc', label: 'Name (Z–A)' },
    { value: 'code,asc', label: 'Code (A–Z)' },
    { value: 'code,desc', label: 'Code (Z–A)' },
    { value: 'id,asc', label: 'ID (asc)' },
    { value: 'id,desc', label: 'ID (desc)' }
  ];

  constructor(
    private leaveTypeService: LeaveTypeService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      maxDays: [null as number | null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadLeaveTypes();
  }

  loadLeaveTypes(page?: number): void {
    if (page !== undefined) this.page = page;
    this.loading = true;
    this.error = '';
    this.leaveTypeService
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
            this.leaveTypes = Array.isArray(r.content) ? r.content as LeaveType[] : [];
            this.totalPages = r.totalPages ?? 0;
            this.totalElements = r.totalElements ?? this.leaveTypes.length;
          } else {
            this.leaveTypes = Array.isArray(data) ? data as LeaveType[] : [];
            this.totalPages = 0;
            this.totalElements = this.leaveTypes.length;
          }
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load leave types.';
          this.leaveTypes = [];
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(page: number): void {
    this.loadLeaveTypes(page);
  }

  onPageSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.loadLeaveTypes(0);
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.loadLeaveTypes(0);
  }

  openAdd(): void {
    this.editingId = null;
    this.form.reset({ code: '', name: '', description: '', maxDays: null, isActive: true });
    this.showForm = true;
  }

  openEdit(item: LeaveType): void {
    if (item.id == null) return;
    this.editingId = item.id;
    this.form.patchValue({
      code: item.code ?? '',
      name: item.name ?? '',
      description: item.description ?? '',
      maxDays: item.maxDays ?? null,
      isActive: item.isActive !== false
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ code: '', name: '', description: '', maxDays: null, isActive: true });
  }

  save(): void {
    if (this.form.invalid) return;
    this.formLoading = true;
    const value = this.form.value;
    const payload: Partial<LeaveType> = {
      code: value.code,
      name: value.name,
      description: value.description || undefined,
      maxDays: value.maxDays ?? undefined,
      isActive: value.isActive !== false
    };

    const obs =
      this.editingId != null
        ? this.leaveTypeService.update(this.editingId, payload)
        : this.leaveTypeService.create(payload);
    obs
      .pipe(finalize(() => (this.formLoading = false)))
      .subscribe({
        next: () => {
          this.loadLeaveTypes(this.page);
          this.cancelForm();
          this.messageDialog.showSuccess('Leave type saved successfully.');
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Save failed.';
          this.messageDialog.showApiError(err);
        }
      });
  }

  deleteLeaveType(item: LeaveType): void {
    if (item.id == null) return;
    if (!confirm(`Delete leave type "${item.name}"?`)) return;
    this.leaveTypeService.delete(item.id).subscribe({
      next: () => {
        this.loadLeaveTypes(this.page);
        this.messageDialog.showSuccess('Leave type deleted.');
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  get f() {
    return this.form.controls;
  }
}
