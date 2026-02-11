import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageDialogService } from '../../core/services/message-dialog.service';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { Leave } from '../../models/leave.model';
import { User } from '../../models/user.model';
import { LeaveType } from '../../models/leave-type.model';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-leave',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingComponent, PaginationComponent],
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit, OnDestroy {

  leaveForm: FormGroup;
  loading = false;
  loadingList = false;
  error = '';

  currentUser: User | null = null;
  myLeaveRequests: Leave[] = [];
  leaveTypes: LeaveType[] = [];
  leavePage = 0;
  leaveSize = 10;
  leaveTotalPages = 0;
  leaveTotalElements = 0;
  leaveSort = 'startDate,desc';
  leavePageSizeOptions = [10, 20, 50];
  leaveSortOptions: SortOption[] = [
    { value: 'startDate,desc', label: 'Start date (newest)' },
    { value: 'startDate,asc', label: 'Start date (oldest)' },
    { value: 'endDate,desc', label: 'End date (newest)' },
    { value: 'endDate,asc', label: 'End date (oldest)' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private leaveService: LeaveService,
    private authService: AuthService,
    private messageDialog: MessageDialogService,
    private cdr: ChangeDetectorRef // ✅ REQUIRED

  ) {
    this.leaveForm = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      leaveTypeId: [null as number | null, Validators.required],
      reason: ['', Validators.required]
    });
  }

  // -------------------------------
  // Lifecycle
  // -------------------------------
  ngOnInit(): void {
    this.loadLeaveTypes();

    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user ?? null;
        if (this.currentUser?.employeeId) {
          this.loadLeaveRequests();
        } else {
          this.loadingList = false;
          this.myLeaveRequests = [];
          this.leaveTotalPages = 0;
          this.leaveTotalElements = 0;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // -------------------------------
  // Load Leave Types
  // -------------------------------
  loadLeaveTypes(): void {
    this.leaveService.getTypes().subscribe({
      next: (res) => {
        const raw = (res && typeof res === 'object' && 'data' in res)
          ? (res as any).data
          : res;

        this.leaveTypes = Array.isArray(raw) ? raw : [];

        if (this.leaveTypes.length > 0 && !this.leaveForm.value.leaveTypeId) {
          this.leaveForm.patchValue({ leaveTypeId: this.leaveTypes[0].id });
        }
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Failed to load leave types.';
      }
    });
  }

  // -------------------------------
  // Load My Leave Requests (paginated)
  // -------------------------------
  loadLeaveRequests(page?: number): void {
    if (!this.currentUser?.employeeId) {
      this.loadingList = false;
      this.cdr.markForCheck();
      return;
    }
    if (page !== undefined) this.leavePage = page;
    this.loadingList = true;

    this.leaveService
      .getByEmployee(this.currentUser.employeeId, { page: this.leavePage, size: this.leaveSize, sort: this.leaveSort })
      .pipe(finalize(() => { this.loadingList = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (res) => {
          const raw = res && typeof res === 'object' && 'content' in res ? res : (res && typeof res === 'object' && 'data' in res ? (res as any).data : res);
          if (raw && typeof raw === 'object' && 'content' in raw) {
            this.myLeaveRequests = Array.isArray((raw as any).content) ? (raw as any).content : [];
            this.leaveTotalPages = (raw as any).totalPages ?? 0;
            this.leaveTotalElements = (raw as any).totalElements ?? 0;
          } else {
            this.myLeaveRequests = Array.isArray(raw) ? raw : [];
            this.leaveTotalPages = 0;
            this.leaveTotalElements = this.myLeaveRequests.length;
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load leave requests.';
          this.cdr.markForCheck();
        }
      });
  }

  leavePrevPage(): void {
    if (this.leavePage > 0) this.loadLeaveRequests(this.leavePage - 1);
  }

  leaveNextPage(): void {
    if (this.leavePage < this.leaveTotalPages - 1) this.loadLeaveRequests(this.leavePage + 1);
  }

  onLeavePageChange(page: number): void {
    this.leavePage = page;
    this.loadLeaveRequests(page);
  }

  onLeavePageSizeChange(size: number): void {
    this.leaveSize = size;
    this.leavePage = 0;
    this.loadLeaveRequests(0);
  }

  onLeaveSortChange(sort: string): void {
    this.leaveSort = sort;
    this.leavePage = 0;
    this.loadLeaveRequests(0);
  }

  // -------------------------------
  // Submit Leave Request
  // -------------------------------
  requestLeave(): void {
    if (this.leaveForm.invalid || !this.currentUser?.employeeId) return;

    this.loading = true;
    this.error = '';

    const payload = {
      ...this.leaveForm.value,
      employeeId: this.currentUser.employeeId
    };

    this.leaveService.create(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.loadLeaveRequests();

          const firstTypeId = this.leaveTypes.length > 0
            ? this.leaveTypes[0].id
            : null;

          this.leaveForm.reset({ leaveTypeId: firstTypeId });

          this.messageDialog.showSuccess('Leave request submitted successfully.');
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Request failed.';
          this.messageDialog.showApiError(err);
        }
      });
  }
}
