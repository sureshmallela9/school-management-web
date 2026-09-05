import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeeCategory } from '../../core/models/fee.model';
import { FeeService } from '../../core/services/fee.service';

@Component({
  selector: 'app-fee-category',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header"><div><p class="eyebrow">QSchool finance</p><h1>Fee categories</h1><p class="lede">Maintain reusable categories such as tuition, library, transport, and activities.</p></div><a routerLink="/admin/fees">Back to fees</a></header>
      <section class="panel">
        <form class="category-form" (ngSubmit)="save()"><label>Name<input [(ngModel)]="name" name="name" required placeholder="Tuition" /></label><label>Description<input [(ngModel)]="description" name="description" placeholder="Core academic fee" /></label><button type="submit">{{ editingId ? 'Update category' : 'Add category' }}</button><button *ngIf="editingId" type="button" class="secondary" (click)="reset()">Cancel</button></form>
        <p class="success" *ngIf="successMessage">{{ successMessage }}</p><p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      </section>
      <section class="panel"><div class="loading" *ngIf="loading">Loading categories...</div><table *ngIf="!loading"><thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody><tr *ngFor="let category of categories"><td>{{ category.name }}</td><td>{{ category.description || '-' }}</td><td><button type="button" (click)="edit(category)">Edit</button><button type="button" class="danger" (click)="remove(category)">Delete</button></td></tr><tr *ngIf="!categories.length"><td colspan="3" class="empty">No fee categories found.</td></tr></tbody></table></section>
    </section>
  `,
  styles: [`
    .page-shell { display: grid; gap: 18px; }.page-header { display:flex; justify-content:space-between; align-items:end; gap:18px; }.eyebrow { margin:0 0 6px; text-transform:uppercase; letter-spacing:.12em; color:#4f46e5; font-size:.72rem; font-weight:700; }.page-header h1 { margin:0 0 7px; }.lede { margin:0; color:#64748b; }.page-header a { color:#4f46e5; font-weight:700; text-decoration:none; }.panel { background:white; border-radius:16px; padding:18px; box-shadow:0 8px 18px rgba(15,23,42,.06); }.category-form { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:12px; align-items:end; }.category-form label { display:grid; gap:6px; color:#334155; font-weight:700; font-size:.85rem; }.category-form input { border:1px solid #dfe7f5; border-radius:10px; padding:10px 12px; font:inherit; }.category-form button, table button { border:0; border-radius:9px; padding:10px 12px; background:#4f46e5; color:white; font-weight:700; cursor:pointer; }.category-form .secondary, table button { background:#eef2ff; color:#3730a3; }.success { color:#15803d; font-weight:700; }.error { color:#b91c1c; font-weight:700; }.loading,.empty { color:#64748b; }table { width:100%; border-collapse:collapse; }th,td { text-align:left; padding:13px 10px; border-bottom:1px solid #edf2f7; }th { background:#f8fafc; }.danger { margin-left:8px; background:#fee2e2; color:#991b1b; }@media(max-width:650px){.page-header{align-items:start;flex-direction:column;}.panel{overflow:auto;}}
  `],
})
export class FeeCategoryComponent implements OnInit {
  private readonly feeService = inject(FeeService);
  private readonly cdr = inject(ChangeDetectorRef);
  categories: FeeCategory[] = [];
  name = '';
  description = '';
  editingId: string | null = null;
  loading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void { this.load(); }
  save(): void {
    const request = this.editingId ? this.feeService.updateCategory(this.editingId, this.name.trim(), this.description.trim()) : this.feeService.createCategory(this.name.trim(), this.description.trim());
    request.subscribe({ next: () => { this.successMessage = 'Fee category saved.'; this.errorMessage = null; this.reset(); this.load(); }, error: (err) => this.showError(err) });
  }
  edit(category: FeeCategory): void { this.editingId = category.id; this.name = category.name; this.description = category.description || ''; }
  remove(category: FeeCategory): void { if (!confirm(`Delete ${category.name}?`)) return; this.feeService.deleteCategory(category.id).subscribe({ next: () => { this.successMessage = 'Fee category deleted.'; this.load(); }, error: (err) => this.showError(err) }); }
  reset(): void { this.editingId = null; this.name = ''; this.description = ''; }
  private load(): void { this.loading = true; this.feeService.getCategories().subscribe({ next: (response) => { this.categories = response.data || []; this.loading = false; this.cdr.detectChanges(); }, error: (err) => { this.loading = false; this.showError(err); } }); }
  private showError(err: { error?: { message?: string }; message?: string }): void { this.errorMessage = err?.error?.message || err?.message || 'Fee category request failed.'; this.loading = false; this.cdr.detectChanges(); }
}
