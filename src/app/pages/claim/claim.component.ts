import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ClaimService } from '../../core/services/claim.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageDialogService } from '../../core/services/message-dialog.service';

import { Claim } from '../../models/claim.model';
import { ClaimType } from '../../models/claim-type.model';
import { User } from '../../models/user.model';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingComponent, PaginationComponent],
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})
export class ClaimComponent implements OnInit, OnDestroy {

  claimForm: FormGroup;
  loading = false;
  loadingList = false;
  error = '';

  currentUser: User | null = null;
  myClaims: Claim[] = [];
  claimTypes: ClaimType[] = [];
  claimPage = 0;
  claimSize = 10;
  claimTotalPages = 0;
  claimTotalElements = 0;
  claimSort = 'claimDate,desc';
  claimPageSizeOptions = [10, 20, 50];
  claimSortOptions: SortOption[] = [
    { value: 'claimDate,desc', label: 'Date (newest)' },
    { value: 'claimDate,asc', label: 'Date (oldest)' },
    { value: 'totalAmount,desc', label: 'Amount (high)' },
    { value: 'totalAmount,asc', label: 'Amount (low)' }
  ];

  private destroy$ = new Subject<void>();

  selectedReceiptFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService,
    private authService: AuthService,
    private messageDialog: MessageDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.claimForm = this.fb.group({
      claimTypeId: [null as number | null, Validators.required],
      claimDate: ['', Validators.required],
      amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadClaimTypes();

    this.claimForm.get('claimTypeId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.selectedClaimType?.requiresReceipt) {
        this.clearReceipt();
      }
    });

    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user ?? null;
        if (this.currentUser?.employeeId) {
          this.loadClaims();
        } else {
          this.loadingList = false;
          this.myClaims = [];
          this.claimTotalPages = 0;
          this.claimTotalElements = 0;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClaimTypes(): void {
    this.claimService.getTypes().subscribe({
      next: (res) => {
        const raw = (res && typeof res === 'object' && 'data' in res)
          ? (res as { data: unknown }).data
          : res;
        this.claimTypes = Array.isArray(raw) ? raw : [];
        if (this.claimTypes.length > 0 && !this.claimForm.value.claimTypeId) {
          this.claimForm.patchValue({ claimTypeId: this.claimTypes[0].id });
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Failed to load claim types.';
      }
    });
  }

  onReceiptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedReceiptFile = input?.files?.[0] ?? null;
    this.cdr.markForCheck();
  }

  clearReceipt(): void {
    this.selectedReceiptFile = null;
    const input = document.getElementById('claimFormReceiptInput') as HTMLInputElement;
    if (input) input.value = '';
    this.cdr.markForCheck();
  }

  loadClaims(page?: number): void {
    if (!this.currentUser?.employeeId) return;
    if (page !== undefined) this.claimPage = page;
    this.loadingList = true;

    this.claimService.getMyClaims({
      page: this.claimPage,
      size: this.claimSize,
      sort: this.claimSort
    }
    ).pipe(finalize(() => { this.loadingList = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (res) => {
          const raw = res && typeof res === 'object' && 'content' in res ? res : (res && typeof res === 'object' && 'data' in res ? (res as { data: unknown }).data : res);
          if (raw && typeof raw === 'object' && 'content' in raw) {
            const r = raw as { content?: unknown; totalPages?: number; totalElements?: number };
            this.myClaims = Array.isArray(r.content) ? r.content as Claim[] : [];
            this.claimTotalPages = r.totalPages ?? 0;
            this.claimTotalElements = r.totalElements ?? 0;
          } else {
            this.myClaims = Array.isArray(raw) ? raw as Claim[] : [];
            this.claimTotalPages = 0;
            this.claimTotalElements = this.myClaims.length;
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load claims.';
          this.cdr.markForCheck();
        }
      });
  }

  onPageChange(page: number): void {
    this.claimPage = page;
    this.loadClaims(page);
  }

  onPageSizeChange(size: number): void {
    this.claimSize = size;
    this.claimPage = 0;
    this.loadClaims(0);
  }

  onSortChange(sort: string): void {
    this.claimSort = sort;
    this.claimPage = 0;
    this.loadClaims(0);
  }

  submitClaim(): void {
    if (this.claimForm.invalid || !this.currentUser?.employeeId) return;

    const ct = this.selectedClaimType;
    if (ct?.requiresReceipt && !this.selectedReceiptFile) {
      this.error = 'This claim type requires a receipt. Please attach a file.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = '';

    const payload = {
      claimTypeId: this.claimForm.value.claimTypeId,
      claimDate: this.claimForm.value.claimDate,
      amount: this.claimForm.value.amount,
      description: this.claimForm.value.description || undefined
    };

    this.claimService.create(payload).subscribe({
      next: (res) => {
        const claim = res as Claim;
        if (this.selectedReceiptFile && claim.id) {
          this.claimService.addAttachment(claim.id, this.selectedReceiptFile).subscribe({
            next: () => {
              this.finishClaimSubmit(claim);
            },
            error: (err) => {
              this.loading = false;
              this.messageDialog.showSuccess(`Claim ${claim.claimNumber ?? ''} created, but receipt upload failed.`);
              this.finishClaimSubmit(claim);
            }
          });
        } else {
          this.finishClaimSubmit(claim);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message ?? err?.returnMessage ?? 'Failed to create claim.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  private finishClaimSubmit(claim: Claim): void {
    this.loading = false;
    this.loadClaims();
    const defaultTypeId = this.claimTypes.length > 0 ? this.claimTypes[0].id : null;
    this.claimForm.reset({
      claimTypeId: defaultTypeId,
      claimDate: new Date().toISOString().split('T')[0],
      amount: null,
      description: ''
    });
    this.claimForm.patchValue({ claimTypeId: defaultTypeId });
    this.clearReceipt();
    this.cdr.markForCheck();
    this.messageDialog.showSuccess(`Claim ${claim.claimNumber ?? ''} created. Submit when ready.`);
  }

  submitForApproval(claim: Claim): void {
    if (!claim.id || claim.status !== 'DRAFT') return;
    this.loading = true;
    this.claimService.submit(claim.id).pipe(finalize(() => this.loading = false)).subscribe({
      next: () => {
        this.loadClaims();
        this.messageDialog.showSuccess('Claim submitted for approval.');
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Submit failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  get selectedClaimType(): ClaimType | undefined {
    const id = this.claimForm?.value?.claimTypeId;
    return id ? this.claimTypes.find((ct) => ct.id === id) : undefined;
  }

  getStatusClass(status: string): { [key: string]: boolean } {
    return {
      'bg-green-200 text-green-900': status === 'APPROVED' || status === 'REIMBURSED',
      'bg-red-200 text-red-900': status === 'REJECTED',
      'bg-amber-200 text-amber-900': status === 'PENDING_SUPERVISOR' || status === 'PENDING_HR',
      'bg-gray-200 text-gray-800': status === 'DRAFT'
    };
  }
}
