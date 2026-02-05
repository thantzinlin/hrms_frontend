import { Component, OnInit } from '@angular/core';
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
  myRequests: Overtime[] = []; // Add type
  pendingRequests: Overtime[] = []; // Add type
  loading = false;
  error = '';
  isManager = false;

  constructor(
    private fb: FormBuilder,
    private overtimeService: OvertimeService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({ // Initialize in constructor
      date: ['', Validators.required],
      hours: [1, [Validators.required, Validators.min(0.5)]],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isManager = this.authService.hasRole('ADMIN') || this.authService.hasRole('MANAGER');
    this.loadRequests();
  }

  loadRequests(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.overtimeService.getByEmployee(user.id).subscribe({
        next: (data) => (this.myRequests = Array.isArray(data) ? data : []),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.')
      });
    }
    if (this.isManager) {
      this.overtimeService.getPending().subscribe({
        next: (data) => (this.pendingRequests = Array.isArray(data) ? data : []),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.')
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const user = this.authService.currentUserValue;
    if (!user?.id) return;
    this.loading = true;
    const payload = { ...this.form.value, employeeId: user.id };
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
