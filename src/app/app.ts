import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = computed(() => this.authService.currentUserSignal());
  readonly isAuthenticated = computed(() => this.currentUser() !== null && this.authService.isAuthenticated());
  readonly isAdmin = computed(() => {
    const roles = this.currentUser()?.roles ?? [];
    return roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPERADMIN');
  });

  readonly navItems = computed(() => [
    { label: 'Home', path: '/app/home' },
    { label: 'Students', path: this.isAdmin() ? '/admin/students' : '/app/students' },
    { label: 'Attendance', path: '/app/attendance' },
    { label: 'Bus', path: '/app/bus' },
    { label: 'Notices', path: '/app/notifications' },
  ]);

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  get userName(): string {
    return this.currentUser()?.name ?? 'User';
  }
}
