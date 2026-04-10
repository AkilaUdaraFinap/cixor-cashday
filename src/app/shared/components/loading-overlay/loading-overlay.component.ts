import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'ccd-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loading) {
      <div class="loading-overlay" [class.inline]="inline">
        <mat-spinner [diameter]="diameter" color="accent" />
        @if (message) { <span class="loading-msg">{{ message }}</span> }
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 48px;
      width: 100%;
    }
    .loading-overlay.inline { padding: 16px; }
    .loading-msg { font-size: 13px; color: var(--ccd-text-muted); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  @Input() loading = false;
  @Input() message?: string;
  @Input() diameter = 40;
  @Input() inline = false;
}
