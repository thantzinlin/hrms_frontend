import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
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
    this.currentUser = null; // Initialize currentUser
    this.leaveForm = this.formBuilder.group({ // Initialize in constructor
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
    if (this.currentUser && this.currentUser.id) { // Ensure currentUser and id exist
      this.leaveService.getByEmployee(this.currentUser.id).subscribe((data: Leave[]) => { // Add type for data
        this.myLeaveRequests = data;
      }, (error: any) => {
        this.error = error.message;
      });
    }
    if (this.isManager) {
      this.leaveService.getPending().subscribe((data: Leave[]) => { // Add type for data
        this.pendingRequests = data;
      }, (error: any) => {
        this.error = error.message;
      });
    }
  }

  requestLeave(): void {
    if (this.leaveForm.invalid || !this.currentUser || !this.currentUser.id) { // Ensure currentUser and id exist
      return;
    }
    this.loading = true;
    const leaveData = { ...this.leaveForm.value, employeeId: this.currentUser.id };
    this.leaveService.create(leaveData).subscribe(() => {
      this.loadLeaveRequests();
      this.leaveForm.reset({leaveType: 'ANNUAL'});
      this.loading = false;
    }, (error: any) => { // Add type for error
      this.error = error.message;
      this.loading = false;
    });
  }

  approve(id: number): void {
    this.leaveService.updateStatus(id, 'APPROVED').subscribe(() => this.loadLeaveRequests(), (error: any) => { // Add type for error
      this.error = error.message;
    });
  }

  reject(id: number): void {
    this.leaveService.updateStatus(id, 'REJECTED').subscribe(() => this.loadLeaveRequests(), (error: any) => { // Add type for error
      this.error = error.message;
    });
  }
}
