import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() close = new EventEmitter<void>();

  constructor(protected authService: AuthService) {}

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  onNavClick(): void {
    this.close.emit();
  }
}
