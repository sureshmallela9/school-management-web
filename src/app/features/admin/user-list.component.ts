import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Admin</p>
          <h1>Users</h1>
        </div>
      </header>

      <div class="card-grid">
        <article class="user-card">
          <strong>Admin</strong>
          <small>school.admin@example.com</small>
        </article>
        <article class="user-card">
          <strong>Teacher</strong>
          <small>teacher@example.com</small>
        </article>
        <article class="user-card">
          <strong>Parent</strong>
          <small>parent@example.com</small>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
      .user-card { background: white; padding: 18px; border-radius: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .user-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,0.1); }
      .user-card small { display: block; margin-top: 6px; color: #64748b; }
    `,
  ],
})
export class UserListComponent {}
