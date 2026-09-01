import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-bus-location',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Bus</p>
          <h1>Live location</h1>
        </div>
      </header>

      <div class="card">
        <div class="map-box">
          <div class="route-line"></div>
          <div class="bus-pin">Bus 7</div>
        </div>
        <div class="status-row">
          <span>Route</span>
          <strong>North campus loop</strong>
        </div>
        <div class="status-row">
          <span>ETA</span>
          <strong>10 minutes</strong>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .card { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 10px 24px rgba(15,23,42,0.06); }
      .map-box { position: relative; height: 220px; border-radius: 18px; background: linear-gradient(135deg, #dbeafe, #f3e8ff); overflow: hidden; margin-bottom: 18px; }
      .route-line { position: absolute; inset: 35% 10% 25% 15%; border: 4px dashed rgba(59,130,246,0.6); border-radius: 999px; }
      .bus-pin { position: absolute; right: 30%; top: 38%; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 10px 14px; border-radius: 12px; font-weight: 700; }
      .status-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #edf2f7; }
      .status-row:last-child { border-bottom: none; }
    `,
  ],
})
export class BusLocationComponent {}
