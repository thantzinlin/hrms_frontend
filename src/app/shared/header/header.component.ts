import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  user: User | null;
  userMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.currentUserValue;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onMenuClick(): void {
    this.toggleSidebar.emit();
  }

  onUserMenuToggle(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }
}
