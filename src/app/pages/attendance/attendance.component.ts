import { Component, OnInit, Injectable } from '@angular/core'; // Add Injectable
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
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
    this.attendanceForm = this.formBuilder.group({
      // Assuming the logged in user will checkin/out
    });
    this.reportForm = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
    this.getTodayAttendance();
  }

  getTodayAttendance(): void {
    if (this.currentUser && this.currentUser.id) { // Ensure currentUser and id exist
      const today = new Date().toISOString().split('T')[0];
      this.attendanceService.getAttendanceByEmployeeAndDateRange(this.currentUser.id, today, today)
        .subscribe((data: Attendance[]) => { // Add type for data
          this.attendanceToday = data;
        }, (error: any) => { // Add type for error
          this.error = error.message;
        });
    }
  }

  checkIn(): void {
    if (this.currentUser && this.currentUser.id) { // Ensure currentUser and id exist
      this.loading = true;
      this.attendanceService.checkIn(this.currentUser.id).subscribe(() => {
        this.getTodayAttendance();
        this.loading = false;
      }, (error: any) => { // Add type for error
        this.error = error.message;
        this.loading = false;
      });
    }
  }

  checkOut(): void {
    const attendance = this.attendanceToday.find(a => !a.checkOutTime);
    if (attendance && attendance.id) { // Ensure attendance and id exist
      this.loading = true;
      this.attendanceService.checkOut(attendance.id).subscribe(() => {
        this.getTodayAttendance();
        this.loading = false;
      }, (error: any) => { // Add type for error
        this.error = error.message;
        this.loading = false;
      });
    }
  }

  getReport(): void {
    if (this.reportForm.invalid || !this.currentUser || !this.currentUser.id) { // Ensure currentUser and id exist
      return;
    }
    const { startDate, endDate } = this.reportForm.value;
    this.attendanceService.getAttendanceByEmployeeAndDateRange(this.currentUser.id, startDate, endDate)
      .subscribe((data: Attendance[]) => { // Add type for data
        this.reportData = data;
      });
  }
}
