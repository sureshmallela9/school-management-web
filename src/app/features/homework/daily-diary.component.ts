import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-daily-diary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header"><div><p class="eyebrow">Parent workspace</p><h1>Homework diary</h1><p class="lede">Homework and class assignments for your children.</p></div></header>
      <article class="availability-card">
        <div class="icon" aria-hidden="true">📚</div>
        <h2>Homework feed isn’t connected yet</h2>
        <p>The current backend integration does not provide a verified parent-scoped homework list. No sample assignments are shown as real school data.</p>
        <p class="next-step">Ask your school to enable a parent-safe homework endpoint scoped to each linked child’s class.</p>
        <a routerLink="/app/students">View your children</a>
      </article>
    </section>
  `,
  styles: [`
    .page-shell { display: grid; gap: 18px; } .page-header { display: flex; align-items: center; }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: .1em; font-size: .72rem; color: #4f46e5; font-weight: 700; }
    h1 { margin: 0 0 6px; } .lede { margin: 0; color: #64748b; }
    .availability-card { max-width: 720px; background: white; border-radius: 20px; padding: 28px; box-shadow: 0 10px 24px rgba(15,23,42,.06); }
    .icon { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 15px; background: #eef2ff; font-size: 1.5rem; }
    h2 { margin: 18px 0 8px; font-size: 1.25rem; } p { color: #475569; line-height: 1.6; }
    .next-step { border-left: 3px solid #6366f1; padding-left: 12px; } a { display: inline-block; margin-top: 6px; color: #4f46e5; font-weight: 700; text-decoration: none; }
  `],
})
export class DailyDiaryComponent {}