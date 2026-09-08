import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BusLocationDto } from '../../core/models/bus.model';
import { BusService } from '../../core/services/bus.service';

@Component({
  selector: 'app-bus-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Bus</p>
          <h1>Live location</h1>
        </div>
      </header>

      <form class="search-form" (ngSubmit)="track()">
        <label>Bus ID<input [(ngModel)]="busId" name="busId" required placeholder="bus-7" /></label>
        <button type="submit">Track bus</button>
      </form>

      <p class="loading" *ngIf="loading">Loading live location...</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <div class="card" *ngIf="location">
        <div class="map-box">
          <div class="route-line"></div>
          <div class="bus-pin">{{ location.busId }}</div>
        </div>
        <div class="status-row">
          <span>Status</span>
          <strong>{{ location.status }}</strong>
        </div>
        <div class="status-row">
          <span>Coordinates</span>
          <strong>{{ location.latitude }}, {{ location.longitude }}</strong>
        </div>
        <div class="status-row">
          <span>ETA</span>
          <strong>{{ location.estimatedArrivalTime }}</strong>
        </div>
        <div class="status-row">
          <span>Last updated</span>
          <strong>{{ location.lastUpdated | date:'short' }}</strong>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .search-form { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }
      .search-form label { display: grid; gap: 6px; font-weight: 700; color: #334155; font-size: 0.85rem; }
      .search-form input { border: 1px solid #dfe7f5; border-radius: 10px; padding: 10px 12px; font: inherit; }
      .search-form button { border: 0; border-radius: 9px; padding: 10px 14px; background: #4f46e5; color: white; font-weight: 700; cursor: pointer; }
      .loading, .empty { color: #64748b; }
      .error { color: #b91c1c; font-weight: 700; }
      .card { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 10px 24px rgba(15,23,42,0.06); }
      .map-box { position: relative; height: 220px; border-radius: 18px; background: linear-gradient(135deg, #dbeafe, #f3e8ff); overflow: hidden; margin-bottom: 18px; }
      .route-line { position: absolute; inset: 35% 10% 25% 15%; border: 4px dashed rgba(59,130,246,0.6); border-radius: 999px; }
      .bus-pin { position: absolute; right: 30%; top: 38%; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 10px 14px; border-radius: 12px; font-weight: 700; }
      .status-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #edf2f7; }
      .status-row:last-child { border-bottom: none; }
    `,
  ],
})
export class BusLocationComponent {
  private readonly busService = inject(BusService);
  private readonly cdr = inject(ChangeDetectorRef);

  busId = '';
  location: BusLocationDto | null = null;
  loading = false;
  errorMessage: string | null = null;

  track(): void {
    if (!this.busId.trim()) {
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.location = null;
    this.busService.getLocation(this.busId.trim()).subscribe({
      next: (response) => {
        this.location = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Failed to fetch bus location.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
