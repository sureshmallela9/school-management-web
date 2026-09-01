import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AttendanceListComponent } from './features/attendance/attendance-list.component';
import { LoginComponent } from './features/auth/login.component';
import { DailyDiaryComponent } from './features/homework/daily-diary.component';
import { BusLocationComponent } from './features/bus/bus-location.component';
import { FeeDashboardComponent } from './features/fees/fee-dashboard.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { LeaveRequestsComponent } from './features/leave-requests/leave-requests.component';
import { ParentDashboardComponent } from './features/parent/parent-dashboard.component';
import { StudentDetailComponent } from './features/students/student-detail.component';
import { StudentListComponent } from './features/students/student-list.component';
import { SchoolListComponent } from './features/admin/school-list.component';
import { TenantListComponent } from './features/admin/tenant-list.component';
import { UserListComponent } from './features/admin/user-list.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: 'home', component: ParentDashboardComponent },
      { path: 'students', component: StudentListComponent },
      { path: 'students/:id', component: StudentDetailComponent },
      { path: 'attendance', component: AttendanceListComponent },
      { path: 'daily-diary', component: DailyDiaryComponent },
      { path: 'fees', component: FeeDashboardComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'leave-requests', component: LeaveRequestsComponent },
      { path: 'bus', component: BusLocationComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'] },
    children: [
      { path: 'tenants', component: TenantListComponent },
      { path: 'schools', component: SchoolListComponent },
      { path: 'users', component: UserListComponent },
      { path: '', redirectTo: 'tenants', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];
