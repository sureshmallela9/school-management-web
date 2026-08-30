import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Admin</p>
          <h1>Tenants</h1>
        </div>
      </header>

      <div class="tenant-list">
        <article class="tenant-item" *ngFor="let tenant of tenants">
          <div>
            <strong>{{ tenant.name }}</strong>
            <small>{{ tenant.code }}</small>
          </div>
          <span class="status" [class.active]="tenant.active">{{ tenant.active ? 'Active' : 'Inactive' }}</span>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .tenant-list { display: grid; gap: 12px; }
      .tenant-item { background: white; border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 8px 18px rgba(15,23,42,0.06); }
      .tenant-item small { display: block; color: #64748b; margin-top: 6px; }
      .status { padding: 6px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: #f1f5f9; color: #334155; }
      .status.active { background: #dcfce7; color: #166534; }
    `,
  ],
})
export class TenantListComponent {
  tenants: Array<{ id?: string; name: string; code: string; address?: string; active?: boolean }> = [];

  constructor(private readonly dataService: MockDataService) {
    this.tenants = this.dataService.getAdminTenants();
  }
}
