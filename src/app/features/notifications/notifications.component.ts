import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';

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

      <article class="notice" *ngFor="let notice of notices">
        <div class="notice-header">
          <strong>{{ notice.title }}</strong>
          <span *ngIf="!notice.isRead" class="badge">New</span>
        </div>
        <p>{{ notice.description }}</p>
        <small>{{ notice.createdAt | date:'mediumDate' }}</small>
      </article>
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
      small { color: #64748b; }
    `,
  ],
})
export class NotificationsComponent {
  notices: Array<{ id: string; title: string; description: string; isRead: boolean; createdAt: string }> = [];

  constructor(private readonly dataService: MockDataService) {
    this.notices = this.dataService.getNotifications();
  }
}
