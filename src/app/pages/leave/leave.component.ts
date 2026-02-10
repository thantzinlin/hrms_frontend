import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { Leave } from '../../models/leave.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-leave',
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Import necessary modules
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  leaveForm: FormGroup;
  loading = false;
  error = '';
  currentUser: User | null;
  myLeaveRequests: Leave[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private leaveService: LeaveService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = null;
    this.leaveForm = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      leaveType: ['ANNUAL', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadLeaveRequests();
  }

  /** Extract list from API response: either unwrapped array or { data: array }. */
  private toLeaveList(value: unknown): Leave[] {
    if (Array.isArray(value)) return value as Leave[];
    if (value && typeof value === 'object' && 'data' in value) {
      const d = (value as { data: unknown }).data;
      return Array.isArray(d) ? (d as Leave[]) : [];
    }
    return [];
  }

  loadLeaveRequests(): void {
    if (this.currentUser?.employeeId) {
      this.leaveService.getByEmployee(this.currentUser.employeeId).subscribe({
        next: (data) => {
          this.myLeaveRequests = this.toLeaveList(data);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  requestLeave(): void {
    if (this.leaveForm.invalid || !this.currentUser?.employeeId) return;
    this.loading = true;
    const leaveData = { ...this.leaveForm.value, employeeId: this.currentUser.employeeId };
    this.leaveService
      .create(leaveData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.loadLeaveRequests();
          this.leaveForm.reset({ leaveType: 'ANNUAL' });
        },
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Request failed.')
      });
  }

}
