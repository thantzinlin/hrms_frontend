import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any;
  loading = true;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.stats = data;
          this.loading = false;
          this.error = '';
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = err?.message || err?.error || 'Failed to load dashboard. Please try again.';
          this.loading = false;
          this.stats = null;
        });
      }
    });
  }
}
