import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ccd-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3 class="empty-title">{{ title }}</h3>
      @if (description) { <p class="empty-desc">{{ description }}</p> }
      @if (actionLabel) {
        <button class="ccd-btn btn-primary mt-4" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }
    .empty-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--ccd-text-disabled);
      margin-bottom: 16px;
    }
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--ccd-text);
      margin-bottom: 8px;
    }
    .empty-desc {
      font-size: 14px;
      color: var(--ccd-text-muted);
      max-width: 400px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() description?: string;
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
