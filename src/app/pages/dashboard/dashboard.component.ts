import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { HolidayService } from '../../core/services/holiday.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { Holiday } from '../../models/holiday.model';

export interface DashboardStats {
  totalEmployees?: number;
  totalDepartments?: number;
  pendingLeaveRequests?: number;
  pendingOtRequests?: number;
  pendingClaimRequests?: number;
  todayAttendanceCount?: number;
  /** 0–100 */
  employeeAttendanceRate?: number;
  /** 0–100 */
  leaveApprovalRate?: number;
  /** 0–100 */
  overtimeUtilization?: number;
  [key: string]: unknown;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  upcomingHolidays: Holiday[] = [];
  loading = true;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private holidayService: HolidayService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.currentUserValue?.token) {
      this.loading = false;
      this.error = 'Not authenticated.';
      this.cdr.detectChanges();
      return;
    }
    this.dashboardService
      .getStats()
      .subscribe({
        next: (data) => {
          const raw = (data ?? null) as Record<string, unknown> | null;
          if (raw && typeof raw === 'object') {
            this.stats = {
              totalEmployees: Number(raw['totalEmployees'] ?? 0),
              totalDepartments: Number(raw['totalDepartments'] ?? 0),
              pendingLeaveRequests: Number(raw['pendingLeaveCount'] ?? raw['pendingLeaveRequests'] ?? 0),
              pendingOtRequests: Number(raw['pendingOvertimeCount'] ?? raw['pendingOtRequests'] ?? 0),
              pendingClaimRequests: Number(raw['pendingClaimCount'] ?? raw['pendingClaimRequests'] ?? 0),
              todayAttendanceCount: Number(raw['todayAttendanceCount'] ?? 0),
              employeeAttendanceRate: Number(raw['employeeAttendanceRate'] ?? 0),
              leaveApprovalRate: Number(raw['leaveApprovalRate'] ?? 0),
              overtimeUtilization: Number(raw['overtimeUtilization'] ?? 0)
            };
          } else {
            this.stats = null;
          }
          this.error = '';
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load dashboard.';
          this.stats = null;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });

    this.holidayService.getForEmployees().subscribe({
      next: (list) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.upcomingHolidays = (Array.isArray(list) ? list : [])
          .filter((h) => h.date && new Date(h.date) >= today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => { /* non-critical */ }
    });
  }
}
