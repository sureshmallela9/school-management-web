import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-fee-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Fees</p>
          <h1>Payments</h1>
        </div>
      </header>

      <div class="card-grid">
        <article class="stat-card">
          <span>Outstanding</span>
          <strong>₹12,450</strong>
        </article>
        <article class="stat-card">
          <span>Paid</span>
          <strong>₹48,000</strong>
        </article>
        <article class="stat-card">
          <span>Due date</span>
          <strong>15 Sep</strong>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
      .stat-card { background: white; padding: 18px; border-radius: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); }
      .stat-card span { display: block; color: #64748b; margin-bottom: 12px; }
      .stat-card strong { font-size: 2rem; }
    `,
  ],
})
export class FeeDashboardComponent {}
