import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

export interface DashboardStats {
  totalEmployees?: number;
  totalDepartments?: number;
  pendingLeaveRequests?: number;
  pendingOtRequests?: number;
  todayAttendanceCount?: number;
  [key: string]: unknown;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
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
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          const raw = (data ?? null) as Record<string, unknown> | null;
          if (raw && typeof raw === 'object') {
            this.stats = {
              totalEmployees: Number(raw['totalEmployees'] ?? 0),
              totalDepartments: Number(raw['totalDepartments'] ?? 0),
              pendingLeaveRequests: Number(raw['pendingLeaveCount'] ?? raw['pendingLeaveRequests'] ?? 0),
              pendingOtRequests: Number(raw['pendingOvertimeCount'] ?? raw['pendingOtRequests'] ?? 0),
              todayAttendanceCount: Number(raw['todayAttendanceCount'] ?? 0)
            };
          } else {
            this.stats = null;
          }
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load dashboard.';
          this.stats = null;
          this.cdr.detectChanges();
        }
      });
  }
}
