import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { OvertimeService } from '../../core/services/overtime.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageDialogService } from '../../core/services/message-dialog.service';
import { Overtime } from '../../models/overtime.model';
import { User } from '../../models/user.model';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-overtime',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingComponent, PaginationComponent],
  templateUrl: './overtime.component.html',
  styleUrls: ['./overtime.component.css']
})
export class OvertimeComponent implements OnInit, OnDestroy {
  form: FormGroup;
  myRequests: Overtime[] = [];
  loading = false;
  loadingList = false;
  error = '';
  overtimePage = 0;
  overtimeSize = 10;
  overtimeTotalPages = 0;
  overtimeTotalElements = 0;
  overtimeSort = 'date,desc';
  overtimePageSizeOptions = [10, 20, 50];
  overtimeSortOptions: SortOption[] = [
    { value: 'date,desc', label: 'Date (newest)' },
    { value: 'date,asc', label: 'Date (oldest)' }
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private overtimeService: OvertimeService,
    private authService: AuthService,
    private messageDialog: MessageDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      hours: [1, [Validators.required, Validators.min(0.5)]],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.loadRequests();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequests(page?: number): void {
    const user = this.authService.currentUserValue;
    if (!user?.employeeId) {
      this.loadingList = false;
      this.cdr.detectChanges();
      return;
    }
    if (page !== undefined) this.overtimePage = page;
    this.loadingList = true;
    this.overtimeService.getByEmployee(user.employeeId, { page: this.overtimePage, size: this.overtimeSize, sort: this.overtimeSort })
      .pipe(finalize(() => { this.loadingList = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          const raw = res && typeof res === 'object' && 'content' in res ? res : (res && typeof res === 'object' && 'data' in res ? (res as any).data : res);
          if (raw && typeof raw === 'object' && 'content' in raw) {
            this.myRequests = Array.isArray((raw as any).content) ? (raw as any).content : [];
            this.overtimeTotalPages = (raw as any).totalPages ?? 0;
            this.overtimeTotalElements = (raw as any).totalElements ?? 0;
          } else {
            this.myRequests = Array.isArray(raw) ? raw : [];
            this.overtimeTotalPages = 0;
            this.overtimeTotalElements = this.myRequests.length;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.';
          this.cdr.detectChanges();
        }
      });
  }

  overtimePrevPage(): void {
    if (this.overtimePage > 0) this.loadRequests(this.overtimePage - 1);
  }

  overtimeNextPage(): void {
    if (this.overtimePage < this.overtimeTotalPages - 1) this.loadRequests(this.overtimePage + 1);
  }

  onOvertimePageChange(page: number): void {
    this.overtimePage = page;
    this.loadRequests(page);
  }

  onOvertimePageSizeChange(size: number): void {
    this.overtimeSize = size;
    this.overtimePage = 0;
    this.loadRequests(0);
  }

  onOvertimeSortChange(sort: string): void {
    this.overtimeSort = sort;
    this.overtimePage = 0;
    this.loadRequests(0);
  }

  submit(): void {
    if (this.form.invalid) return;
    const user = this.authService.currentUserValue;
    if (!user?.employeeId) return;
    this.error = '';
    this.loading = true;
    const payload = { ...this.form.value, employeeId: user.employeeId };
    this.overtimeService
      .create(payload)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          this.form.reset();
          this.loadRequests();
          this.messageDialog.showSuccess('Overtime request submitted successfully.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Submit failed.';
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }
}
