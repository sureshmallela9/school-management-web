import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../attendance.service';
import { AttendanceAudit } from '../attendance.model';

@Component({
  selector: 'app-attendance-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Attendance</p>
          <h1>Audit Trail</h1>
        </div>
        <button type="button" class="ghost-btn" (click)="goTo('/admin/attendance')">Back to list</button>
      </div>

      <div class="filter-row">
        <label>
          <span>Attendance ID</span>
          <input type="text" [(ngModel)]="filters.attendanceId" placeholder="att-1" (ngModelChange)="onFilterChange()" />
        </label>
        <label>
          <span>From date</span>
          <input type="date" [(ngModel)]="filters.fromDate" (ngModelChange)="onFilterChange()" />
        </label>
        <label>
          <span>To date</span>
          <input type="date" [(ngModel)]="filters.toDate" (ngModelChange)="onFilterChange()" />
        </label>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Attendance ID</th>
              <th>Action</th>
              <th>Changed By</th>
              <th>Changed At</th>
              <th>Previous</th>
              <th>New</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td>{{ log.attendanceId }}</td>
              <td><span class="badge" [class]="log.action.toLowerCase()">{{ log.action }}</span></td>
              <td>{{ log.changedBy }}</td>
              <td>{{ log.changedAt | date:'medium' }}</td>
              <td>
                <div class="audit-value" *ngFor="let field of formatValue(log.previousValue)">
                  <strong *ngIf="field.key">{{ field.key }}</strong><span>{{ field.value }}</span>
                </div>
              </td>
              <td>
                <div class="audit-value" *ngFor="let field of formatValue(log.newValue)">
                  <strong *ngIf="field.key">{{ field.key }}</strong><span>{{ field.value }}</span>
                </div>
              </td>
            </tr>
            <tr *ngIf="!logs.length">
              <td colspan="6" class="empty-cell">No audit entries found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button type="button" [disabled]="page === 1" (click)="changePage(page - 1)">Previous</button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button type="button" [disabled]="page === totalPages" (click)="changePage(page + 1)">Next</button>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { display: grid; gap: 18px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.12em; color: #4f46e5; font-size: 0.72rem; font-weight: 700; }
      h1 { margin: 0; }
      .ghost-btn { border: none; background: #eef2ff; color: #3730a3; padding: 12px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .filter-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; background: white; border-radius: 16px; padding: 14px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      .filter-row label { display: grid; gap: 6px; font-weight: 600; color: #334155; font-size: 0.85rem; }
      .filter-row input { border: 1px solid #dfe7f5; border-radius: 10px; padding: 10px 12px; font: inherit; }
      .table-wrap { overflow: auto; background: white; border-radius: 18px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04); }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 14px 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
      th { background: #f8fafc; }
      td:nth-child(5), td:nth-child(6) { min-width: 240px; max-width: 360px; vertical-align: top; }
      tbody tr { transition: background 0.15s ease; }
      tbody tr:hover { background: #f8fafc; }
      .audit-value { display: flex; gap: 7px; line-height: 1.4; overflow-wrap: anywhere; }
      .audit-value + .audit-value { margin-top: 5px; }
      .audit-value strong { color: #475569; font-size: 0.76rem; white-space: nowrap; }
      .audit-value span { color: #334155; font-size: 0.82rem; }
      .empty-cell { text-align: center; color: #64748b; padding: 24px; }
      .badge { padding: 6px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: #f1f5f9; color: #334155; }
      .badge.create { background: #dcfce7; color: #166534; }
      .badge.update { background: #fef3c7; color: #92400e; }
      .badge.delete { background: #fee2e2; color: #991b1b; }
      .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; background: white; padding: 12px; border-radius: 12px; }
      .pagination button { border: none; border-radius: 10px; background: #e2e8f0; padding: 8px 12px; font-weight: 700; cursor: pointer; }
      .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    `,
  ],
})
export class AttendanceAuditComponent implements OnInit {
  logs: AttendanceAudit[] = [];
  filters: { attendanceId?: string; fromDate?: string; toDate?: string } = {};
  page = 1;
  limit = 20;
  totalPages = 1;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadLogs();
  }

  changePage(nextPage: number): void {
    this.page = nextPage;
    this.loadLogs();
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  formatValue(value: string | null): { key: string; value: string }[] {
    if (!value) {
      return [{ key: '', value: '-' }];
    }

    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.entries(parsed as Record<string, unknown>).map(([key, item]) => ({
          key: this.formatKey(key),
          value: this.formatFieldValue(item),
        }));
      }
      return [{ key: '', value: this.formatFieldValue(parsed) }];
    } catch {
      return [{ key: '', value }];
    }
  }

  private formatKey(key: string): string {
    return key
      .replace(/[A-Z]/g, (letter) => ` ${letter}`)
      .replace(/^./, (letter) => letter.toUpperCase())
      .trim();
  }

  private formatFieldValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private loadLogs(): void {
    const tenantId = this.authService.getTenantId() ?? 'tenant-001';
    this.attendanceService.getAuditTrail(tenantId, this.filters, this.page, this.limit).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.totalPages = response.totalPages;
        this.cdr.detectChanges();
      },
      error: () => {
        this.logs = [];
        this.cdr.detectChanges();
      },
    });
  }
}
