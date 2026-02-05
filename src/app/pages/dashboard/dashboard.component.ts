import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

export interface DashboardStats {
  totalEmployees?: number;
  totalDepartments?: number;
  pendingLeaveRequests?: number;
  pendingOtRequests?: number;
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Only call API when user is authenticated so the request includes the token (avoids 401 during hydration or race)
    if (!this.authService.currentUserValue?.token) {
      this.loading = false;
      this.error = 'Not authenticated.';
      return;
    }
    this.dashboardService
      .getStats()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.stats = (data ?? null) as DashboardStats | null;
          this.error = '';
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load dashboard.';
          this.stats = null;
        }
      });
  }
}
