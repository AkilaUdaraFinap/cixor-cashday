import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'ccd-page-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-header">
      <div class="page-header-left">
        @if (backRoute) {
          <button type="button" class="ccd-btn btn-ghost btn-sm back-btn" (click)="onBack()" aria-label="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>
        }
        <div>
          @if (breadcrumb) { <div class="breadcrumb-text">{{ breadcrumb }}</div> }
          <h1 class="page-title">{{ title }}</h1>
          @if (subtitle) { <p class="page-subtitle">{{ subtitle }}</p> }
        </div>
      </div>
      <div class="page-header-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 28px;
    }
    .page-header-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .back-btn { padding: 6px; min-width: unset; }
    .breadcrumb-text { font-size: 12px; color: var(--ccd-text-muted); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
    .page-subtitle { font-size: 14px; color: var(--ccd-text-muted); margin-top: 4px; }
    .page-header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumb?: string;
  @Input() backRoute?: string;
  @Output() back = new EventEmitter<void>();

  onBack(): void {
    this.back.emit();

    if (this.back.observed) {
      return;
    }

    if (this.backRoute) {
      void this.router.navigateByUrl(this.backRoute);
      return;
    }

    this.location.back();
  }
}
