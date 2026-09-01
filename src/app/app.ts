import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUser = computed(() => this.authService.getCurrentUser());

  readonly navItems = [
    { label: 'Home', path: '/app/home' },
    { label: 'Students', path: '/app/students' },
    { label: 'Attendance', path: '/app/attendance' },
    { label: 'Bus', path: '/app/bus' },
    { label: 'Notices', path: '/app/notifications' },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  get userName(): string {
    return this.currentUser()?.name ?? 'User';
  }
}
