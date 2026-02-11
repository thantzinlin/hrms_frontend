import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AttendanceService } from '../../core/services/attendance.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageDialogService } from '../../core/services/message-dialog.service';
import { Attendance } from '../../models/attendance.model';
import { User } from '../../models/user.model';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent], // Import necessary modules
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit, OnDestroy {
  attendanceForm: FormGroup;
  reportForm: FormGroup;
  loading = false;
  error = '';
  currentUser: User | null = null;
  attendanceToday: Attendance[] = [];
  reportData: Attendance[] = [];
  reportPage = 0;
  reportSize = 10;
  reportTotalPages = 0;
  reportTotalElements = 0;
  loadingReport = false;
  reportLoaded = false;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private messageDialog: MessageDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.attendanceForm = this.formBuilder.group({});
    this.reportForm = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user ?? null;
      this.getTodayAttendance();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Normalize API response to Attendance[]. */
  private toAttendanceList(value: unknown): Attendance[] {
    if (Array.isArray(value)) return value as Attendance[];
    if (value && typeof value === 'object' && 'data' in value) {
      const d = (value as { data: unknown }).data;
      if (Array.isArray(d)) return d as Attendance[];
      if (d && typeof d === 'object' && 'content' in d) {
        const c = (d as { content: unknown }).content;
        return Array.isArray(c) ? (c as Attendance[]) : [];
      }
    }
    return [];
  }

  getTodayAttendance(): void {
    if (!this.currentUser?.employeeId) return;
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService
      .getAttendanceByEmployeeAndDateRange(this.currentUser.employeeId, today, today, { page: 0, size: 31 })
      .subscribe({
        next: (res) => {
          const raw = res && typeof res === 'object' && 'content' in res ? res : res;
          if (raw && typeof raw === 'object' && 'content' in raw) {
            this.attendanceToday = Array.isArray((raw as any).content) ? (raw as any).content : [];
          } else {
            this.attendanceToday = this.toAttendanceList(res);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.';
          this.cdr.detectChanges();
        }
      });
  }

  checkIn(): void {
    if (!this.currentUser?.id) return;
    this.error = '';
    this.loading = true;
    this.attendanceService
      .checkIn(this.currentUser.id)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          this.getTodayAttendance();
          this.messageDialog.showSuccess('Check-in recorded successfully.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Check-in failed.';
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  checkOut(): void {
    const attendance = this.attendanceToday.find((a) => !a.checkOutTime);
    if (!attendance?.id) return;
    this.error = '';
    this.loading = true;
    this.attendanceService
      .checkOut(attendance.id)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          this.getTodayAttendance();
          this.messageDialog.showSuccess('Check-out recorded successfully.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Check-out failed.';
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  getReport(page?: number): void {
    if (this.reportForm.invalid || !this.currentUser?.employeeId) return;
    if (page !== undefined) this.reportPage = page;
    this.error = '';
    this.loadingReport = true;
    this.reportLoaded = true;
    const { startDate, endDate } = this.reportForm.value;
    this.attendanceService
      .getAttendanceByEmployeeAndDateRange(this.currentUser.employeeId, startDate, endDate, { page: this.reportPage, size: this.reportSize, sort: 'date,desc' })
      .pipe(finalize(() => { this.loadingReport = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          const raw = res && typeof res === 'object' && 'content' in res ? res : res;
          if (raw && typeof raw === 'object' && 'content' in raw) {
            this.reportData = Array.isArray((raw as any).content) ? (raw as any).content : [];
            this.reportTotalPages = (raw as any).totalPages ?? 0;
            this.reportTotalElements = (raw as any).totalElements ?? 0;
          } else {
            this.reportData = this.toAttendanceList(res);
            this.reportTotalPages = 0;
            this.reportTotalElements = this.reportData.length;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Report failed.';
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  reportPrevPage(): void {
    if (this.reportPage > 0) this.getReport(this.reportPage - 1);
  }

  reportNextPage(): void {
    if (this.reportPage < this.reportTotalPages - 1) this.getReport(this.reportPage + 1);
  }
}
