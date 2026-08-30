import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Leave requests</p>
          <h1>Manage absence</h1>
        </div>
      </header>

      <div class="card">
        <h3>New request</h3>
        <form class="request-form">
          <label>
            <span>Student</span>
            <select>
              <option>Aisha Sharma</option>
              <option>Rohan Sharma</option>
            </select>
          </label>
          <label>
            <span>Reason</span>
            <textarea rows="4" placeholder="Write a brief reason"></textarea>
          </label>
          <button type="button">Submit request</button>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .card { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 10px 24px rgba(15,23,42,0.06); }
      .request-form { display: grid; gap: 16px; }
      label { display: grid; gap: 8px; font-weight: 600; }
      select, textarea { border: 1px solid #dfe7f5; border-radius: 12px; padding: 10px 12px; font: inherit; }
      button { border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border-radius: 12px; padding: 12px 16px; font-weight: 700; }
    `,
  ],
})
export class LeaveRequestsComponent {}
