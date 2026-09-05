import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { School } from '../../core/models/school.model';
import { SchoolService } from '../../core/services/school.service';

@Component({
  selector: 'app-school-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Admin</p>
          <h1>Schools</h1>
        </div>
      </header>

      <form class="search-form" (ngSubmit)="search()">
        <label>Name<input [(ngModel)]="name" name="name" placeholder="Search by name" /></label>
        <label>Code<input [(ngModel)]="code" name="code" placeholder="Search by code" /></label>
        <button type="submit">Search</button>
      </form>

      <p class="loading" *ngIf="loading">Loading schools...</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <div class="card-grid" *ngIf="!loading">
        <article class="card" *ngFor="let school of schools">
          <strong>{{ school.name }}</strong>
          <small>{{ school.code }}</small>
          <p>{{ school.address || 'No address on file' }}</p>
        </article>
        <p class="empty" *ngIf="!schools.length">No schools found.</p>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; color: #4f46e5; font-weight: 700; }
      .search-form { display: flex; gap: 12px; flex-wrap: wrap; align-items: end; }
      .search-form label { display: grid; gap: 6px; font-weight: 700; color: #334155; font-size: 0.85rem; }
      .search-form input { border: 1px solid #dfe7f5; border-radius: 10px; padding: 10px 12px; font: inherit; }
      .search-form button { border: 0; border-radius: 9px; padding: 10px 14px; background: #4f46e5; color: white; font-weight: 700; cursor: pointer; }
      .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
      .card { background: white; padding: 18px; border-radius: 18px; box-shadow: 0 8px 18px rgba(15,23,42,0.06); transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,0.1); }
      .card p { margin: 8px 0 0; color: #64748b; }
      .card small { display: block; margin-top: 4px; color: #64748b; }
      .loading, .empty { color: #64748b; }
      .error { color: #b91c1c; font-weight: 700; }
    `,
  ],
})
export class SchoolListComponent implements OnInit {
  private readonly schoolService = inject(SchoolService);
  private readonly cdr = inject(ChangeDetectorRef);

  schools: School[] = [];
  name = '';
  code = '';
  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.errorMessage = null;
    this.schoolService.search(this.name.trim() || undefined, this.code.trim() || undefined).subscribe({
      next: (schools) => {
        this.schools = schools || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load schools.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}

