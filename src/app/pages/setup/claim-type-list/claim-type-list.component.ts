import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, timeout } from 'rxjs/operators';

import { ClaimTypeService } from '../../../core/services/claim-type.service';
import { ClaimType } from '../../../models/claim-type.model';
import { MessageDialogService } from '../../../core/services/message-dialog.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-claim-type-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './claim-type-list.component.html',
  styleUrls: ['./claim-type-list.component.css']
})
export class ClaimTypeListComponent implements OnInit {

  claimTypes: ClaimType[] = [];
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
    private claimTypeService: ClaimTypeService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      maxAmountPerClaim: [null as number | null],
      requiresReceipt: [false],
      currency: ['USD'],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadClaimTypes();
  }

  loadClaimTypes(page?: number): void {
    if (page !== undefined) this.page = page;
    this.loading = true;
    this.error = '';
    this.claimTypeService
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
          // Backend returns { returnCode, returnMessage, data: { content, totalPages, totalElements } }; ApiService unwraps to data
          const raw = data && typeof data === 'object' && 'content' in data ? data : null;
          if (raw && typeof raw === 'object') {
            const r = raw as { content?: unknown; totalPages?: number; totalElements?: number };
            this.claimTypes = Array.isArray(r.content) ? (r.content as ClaimType[]) : [];
            this.totalPages = r.totalPages ?? 0;
            this.totalElements = r.totalElements ?? this.claimTypes.length;
          } else {
            this.claimTypes = Array.isArray(data) ? (data as ClaimType[]) : [];
            this.totalPages = 0;
            this.totalElements = this.claimTypes.length;
          }
          this.error = '';
          // Don't defer: update bindings so finalize() + detectChanges() show list on first load
        },
        error: (err) => {
          const errMsg = err?.message ?? err?.returnMessage ?? 'Failed to load claim types.';
          this.messageDialog.showApiError(err);
          setTimeout(() => {
            this.error = errMsg;
            this.claimTypes = [];
            this.totalPages = 0;
            this.totalElements = 0;
            this.cdr.detectChanges();
          }, 0);
        }
      });
  }

  onPageChange(page: number): void {
    this.loadClaimTypes(page);
  }

  onPageSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.loadClaimTypes(0);
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.loadClaimTypes(0);
  }

  openAdd(): void {
    this.editingId = null;
    this.form.reset({ code: '', name: '', description: '', maxAmountPerClaim: null, requiresReceipt: false, currency: 'USD', isActive: true });
    this.showForm = true;
  }

  openEdit(item: ClaimType): void {
    if (item.id == null) return;
    this.editingId = item.id;
    this.form.patchValue({
      code: item.code ?? '',
      name: item.name ?? '',
      description: item.description ?? '',
      maxAmountPerClaim: item.maxAmountPerClaim ?? null,
      requiresReceipt: item.requiresReceipt ?? false,
      currency: item.currency ?? 'USD',
      isActive: item.isActive !== false
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ code: '', name: '', description: '', maxAmountPerClaim: null, requiresReceipt: false, currency: 'USD', isActive: true });
  }

  save(): void {
    if (this.form.invalid) return;
    this.formLoading = true;
    const value = this.form.value;
    const payload: Partial<ClaimType> = {
      code: value.code,
      name: value.name,
      description: value.description || undefined,
      maxAmountPerClaim: value.maxAmountPerClaim ?? undefined,
      requiresReceipt: value.requiresReceipt ?? false,
      currency: value.currency ?? 'USD',
      isActive: value.isActive !== false
    };

    const obs = this.editingId != null
      ? this.claimTypeService.update(this.editingId, payload)
      : this.claimTypeService.create(payload);
    obs.pipe(finalize(() => (this.formLoading = false))).subscribe({
      next: () => {
        this.loadClaimTypes(this.page);
        this.cancelForm();
        this.messageDialog.showSuccess('Claim type saved successfully.');
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Save failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  deleteClaimType(item: ClaimType): void {
    if (item.id == null) return;
    if (!confirm(`Delete claim type "${item.name}"?`)) return;
    this.claimTypeService.delete(item.id).subscribe({
      next: () => {
        this.loadClaimTypes(this.page);
        this.messageDialog.showSuccess('Claim type deleted.');
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
