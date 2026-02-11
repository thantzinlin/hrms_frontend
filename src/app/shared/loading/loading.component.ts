import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable loading spinner matching the Dashboard loading UI.
 * Use size="sm" for compact inline use (e.g. inside cards/tables).
 */
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
  /** 'default' = full section (Dashboard style), 'sm' = compact inline */
  @Input() size: 'default' | 'sm' = 'default';
}
