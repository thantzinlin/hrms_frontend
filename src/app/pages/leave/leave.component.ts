import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { Leave } from '../../models/leave.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-leave',
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule], // Import necessary modules
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  leaveForm: FormGroup;
  loading = false;
  error = '';
  currentUser: User | null;
  myLeaveRequests: Leave[] = [];
  pendingRequests: Leave[] = [];
  isManager = false;

  constructor(
    private formBuilder: FormBuilder,
    private leaveService: LeaveService,
    private authService: AuthService
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
    this.isManager = this.authService.hasRole('ADMIN') || this.authService.hasRole('MANAGER');
    this.loadLeaveRequests();
  }

  loadLeaveRequests(): void {
    if (this.currentUser?.id) {
      this.leaveService.getByEmployee(this.currentUser.employeeId).subscribe({
        next: (data) => (this.myLeaveRequests = Array.isArray(data) ? data : []),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.')
      });
    }
    if (this.isManager) {
      this.leaveService.getPending().subscribe({
        next: (data) => (this.pendingRequests = Array.isArray(data) ? data : []),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.')
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

  approve(id: number): void {
    this.leaveService.updateStatus(id, 'APPROVED').subscribe({
      next: () => this.loadLeaveRequests(),
      error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Action failed.')
    });
  }

  reject(id: number): void {
    this.leaveService.updateStatus(id, 'REJECTED').subscribe({
      next: () => this.loadLeaveRequests(),
      error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Action failed.')
    });
  }
}
