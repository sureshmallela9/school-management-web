import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Notices</p>
          <h1>Notifications</h1>
        </div>
      </header>

      <p class="loading" *ngIf="loading">Loading notifications...</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <article class="notice" *ngFor="let notice of notices">
        <div class="notice-header">
          <strong>{{ notice.title }}</strong>
          <span *ngIf="!notice.isRead" class="badge">New</span>
        </div>
        <p>{{ notice.description }}</p>
        <div class="notice-footer">
          <small>{{ notice.createdAt | date:'mediumDate' }}</small>
          <button *ngIf="isAdmin && !notice.isRead" type="button" (click)="markAsRead(notice.id)">Mark as read</button>
        </div>
      </article>
      <p class="empty" *ngIf="!loading && !notices.length">No notifications found.</p>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .notice { background: white; border-radius: 18px; padding: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .notice:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,0.1); }
      .notice-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .notice p { color: #475569; }
      .badge { background: #ddd6fe; color: #5b21b6; padding: 5px 8px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; }
      .notice-footer { display: flex; justify-content: space-between; align-items: center; }
      .notice-footer button { border: 0; border-radius: 8px; padding: 6px 10px; background: #eef2ff; color: #3730a3; font-weight: 700; cursor: pointer; }
      .loading, .empty { color: #64748b; }
      .error { color: #b91c1c; font-weight: 700; }
      small { color: #64748b; }
    `,
  ],
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly dataService = inject(MockDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  notices: Array<{ id: string; title: string; description: string; isRead: boolean; createdAt: string }> = [];
  loading = true;
  errorMessage: string | null = null;

  get isAdmin(): boolean {
    const roles = this.authService.getRoles();
    return roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPERADMIN');
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadAdminNotifications();
    } else {
      // No parent/teacher-facing notification-list endpoint is documented on the backend yet.
      this.notices = this.dataService.getNotifications();
      this.loading = false;
    }
  }

  private loadAdminNotifications(): void {
    this.loading = true;
    this.notificationService.listAdmin(1, 20).subscribe({
      next: (response) => {
        this.notices = (response.data || []).map((n) => ({
          id: n.id,
          title: n.title,
          description: n.message,
          isRead: n.isRead,
          createdAt: n.timestamp ? new Date(n.timestamp).toISOString() : '',
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load notifications.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const notice = this.notices.find((n) => n.id === id);
        if (notice) {
          notice.isRead = true;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Failed to mark notification as read.';
        this.cdr.detectChanges();
      },
    });
  }
}
