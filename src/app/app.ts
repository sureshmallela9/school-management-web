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
  readonly isTeacher = computed(() => (this.currentUser()?.roles ?? []).includes('ROLE_TEACHER'));

  readonly navItems = computed(() => [
    ...(this.isTeacher()
      ? [
          { label: 'Home', path: '/teacher/home' },
          { label: 'Attendance', path: '/teacher/attendance/mark' },
          { label: 'Today', path: '/teacher/attendance/today' },
          { label: 'Student History', path: '/teacher/attendance/student' },
          { label: 'Homework', path: '/teacher/homework' },
          { label: 'Fees', path: '/teacher/fees' },
        ]
      : this.isAdmin()
        ? [
            { label: 'Home', path: '/admin/tenants' },
            { label: 'Students', path: '/admin/students' },
            { label: 'Attendance', path: '/admin/attendance' },
            { label: 'Fees', path: '/admin/fees' },
            { label: 'Schools', path: '/admin/schools' },
          ]
        : [
            { label: 'Home', path: '/app/home' },
            { label: 'Children', path: '/app/students' },
            { label: 'Attendance', path: '/app/attendance' },
            { label: 'Fees', path: '/app/fees' },
            { label: 'Homework', path: '/app/daily-diary' },
            { label: 'Leave requests', path: '/app/leave-requests' },
            { label: 'Bus', path: '/app/bus' },
            { label: 'Notices', path: '/app/notifications' },
          ]),
  ]);

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  get userName(): string {
    return this.currentUser()?.name ?? 'User';
  }
}
