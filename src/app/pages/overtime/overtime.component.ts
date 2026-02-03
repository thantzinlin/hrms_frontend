import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { OvertimeService } from '../../core/services/overtime.service';
import { AuthService } from '../../core/services/auth.service';
import { Overtime } from '../../models/overtime.model'; // Import Overtime model
import { User } from '../../models/user.model'; // Import User model

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
    if (user && user.id) { // Ensure user and id exist
      this.overtimeService.getByEmployee(user.id).subscribe((data: Overtime[]) => this.myRequests = data, (err: any) => { this.error = err.message || err; }); // Add type for data
    }
    if (this.isManager) {
      this.overtimeService.getPending().subscribe((data: Overtime[]) => this.pendingRequests = data, (err: any) => { this.error = err.message || err; }); // Add type for data
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const user = this.authService.currentUserValue;
    if (!user || !user.id) return;
    this.loading = true;
    const payload = { ...this.form.value, employeeId: user.id };
    this.overtimeService.create(payload).subscribe(() => { this.form.reset(); this.loadRequests(); this.loading = false; }, (err: any) => { this.error = err.message || err; this.loading = false; }); // Add type for error
  }

  approve(id: number): void { this.overtimeService.updateStatus(id, 'APPROVED').subscribe(() => this.loadRequests(), (err: any) => { this.error = err.message || err; }); } // Add type for error
  reject(id: number): void { this.overtimeService.updateStatus(id, 'REJECTED').subscribe(() => this.loadRequests(), (err: any) => { this.error = err.message || err; }); } // Add type for error
}
