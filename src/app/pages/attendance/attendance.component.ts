import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AttendanceService } from '../../core/services/attendance.service';
import { AuthService } from '../../core/services/auth.service';
import { Attendance } from '../../models/attendance.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-attendance',
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule], // Import necessary modules
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  attendanceForm: FormGroup;
  reportForm: FormGroup;
  loading = false;
  error = '';
  currentUser: User | null;
  attendanceToday: Attendance[] = [];
  reportData: Attendance[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {
    this.currentUser = null; // Initialize currentUser
    this.attendanceForm = this.formBuilder.group({}); // Initialize in constructor
    this.reportForm = this.formBuilder.group({ // Initialize in constructor
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.getTodayAttendance();
  }

  getTodayAttendance(): void {
    if (!this.currentUser?.id) return;
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService
      .getAttendanceByEmployeeAndDateRange(this.currentUser.employeeId, today, today)
      .subscribe({
        next: (data) => (this.attendanceToday = Array.isArray(data) ? data : []),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Failed to load.')
      });
  }

  checkIn(): void {
    if (!this.currentUser?.id) return;
    this.loading = true;
    this.attendanceService
      .checkIn(this.currentUser.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.getTodayAttendance(),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Check-in failed.')
      });
  }

  checkOut(): void {
    const attendance = this.attendanceToday.find((a) => !a.checkOutTime);
    if (!attendance?.id) return;
    this.loading = true;
    this.attendanceService
      .checkOut(attendance.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.getTodayAttendance(),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Check-out failed.')
      });
  }

  getReport(): void {
    if (this.reportForm.invalid || !this.currentUser?.id) return;
    const { startDate, endDate } = this.reportForm.value;
    this.attendanceService
      .getAttendanceByEmployeeAndDateRange(this.currentUser.employeeId, startDate, endDate)
      .subscribe({
        next: (data) => (this.reportData = Array.isArray(data) ? data : []),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Report failed.')
      });
  }
}
