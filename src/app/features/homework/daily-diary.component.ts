import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-daily-diary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Daily diary</p>
          <h1>Homework</h1>
        </div>
      </header>

      <div class="diary-list">
        <article class="entry" *ngFor="let item of diary">
          <div class="entry-header">
            <strong>{{ item.title }}</strong>
            <span>{{ item.status }}</span>
          </div>
          <p>{{ item.description }}</p>
          <small>{{ item.subjectName }} • Due {{ item.dueDate | date:'mediumDate' }}</small>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .diary-list { display: grid; gap: 14px; }
      .entry { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 10px 24px rgba(15,23,42,0.06); }
      .entry-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .entry p { margin: 10px 0; color: #475569; }
      .entry small { color: #64748b; }
      .entry-header span { background: #eef2ff; color: #3730a3; padding: 6px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
    `,
  ],
})
export class DailyDiaryComponent {
  diary: Array<{ id: string; title: string; description?: string; subjectName?: string; dueDate?: string; status?: string }> = [];

  constructor(private readonly dataService: MockDataService) {
    this.diary = this.dataService.getParentDashboard().children.flatMap((child) => child.dailyDiary ?? []);
  }
}
