import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { OvertimeService } from '../../core/services/overtime.service';
import { AuthService } from '../../core/services/auth.service';
import { Overtime } from '../../models/overtime.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-overtime',
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule], // Import necessary modules
  templateUrl: './overtime.component.html',
  styleUrls: ['./overtime.component.css']
})
export class OvertimeComponent implements OnInit {
  form: FormGroup;
  myRequests: Overtime[] = [];
  pendingRequests: Overtime[] = [];
  loading = false;
  error = '';
  isManager = false;

  constructor(
    private fb: FormBuilder,
    private overtimeService: OvertimeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      hours: [1, [Validators.required, Validators.min(0.5)]],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isManager = this.authService.hasRole('ADMIN') || this.authService.hasRole('MANAGER') || this.authService.hasRole('HR');
    this.loadRequests();
  }

  /** Extract list from API response: either unwrapped array or { data: array }. */
  private toOvertimeList(value: unknown): Overtime[] {
    if (Array.isArray(value)) return value as Overtime[];
    if (value && typeof value === 'object' && 'data' in value) {
      const d = (value as { data: unknown }).data;
      return Array.isArray(d) ? (d as Overtime[]) : [];
    }
    return [];
  }

  loadRequests(): void {
    const user = this.authService.currentUserValue;
    if (user?.employeeId) {
      this.overtimeService.getByEmployee(user.employeeId).subscribe({
        next: (data) => {
          this.myRequests = this.toOvertimeList(data);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.';
          this.cdr.detectChanges();
        }
      });
    }
    if (this.isManager) {
      this.overtimeService.getPending().subscribe({
        next: (data) => {
          this.pendingRequests = this.toOvertimeList(data);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const user = this.authService.currentUserValue;
    if (!user?.id) return;
    this.loading = true;
    const payload = { ...this.form.value, employeeId: user.employeeId };
    this.overtimeService
      .create(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.form.reset();
          this.loadRequests();
        },
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Submit failed.')
      });
  }

  approve(id: number): void {
    this.overtimeService.updateStatus(id, 'APPROVED').subscribe({
      next: () => this.loadRequests(),
      error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Action failed.')
    });
  }

  reject(id: number): void {
    this.overtimeService.updateStatus(id, 'REJECTED').subscribe({
      next: () => this.loadRequests(),
      error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Action failed.')
    });
  }
}
