import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type UiButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ccd-ui-button',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <button
      class="ccd-btn ccd-ui-button"
      [class.btn-primary]="variant === 'primary'"
      [class.btn-secondary]="variant === 'secondary'"
      [class.btn-ghost]="variant === 'ghost'"
      [class.btn-danger]="variant === 'danger'"
      [class.btn-success]="variant === 'success'"
      [class.btn-sm]="size === 'sm'"
      [class.btn-lg]="size === 'lg'"
      [class.btn-full]="fullWidth"
      [attr.type]="type"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading"
    >
      @if (loading) {
        <mat-spinner diameter="16" />
      }
      <span class="ccd-ui-button__content">
        <ng-content />
      </span>
    </button>
  `,
  styles: [`
    .ccd-ui-button {
      justify-content: center;
      min-height: 40px;
    }

    .ccd-ui-button__content {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    mat-spinner {
      --mdc-circular-progress-active-indicator-color: currentColor;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  @Input() variant: UiButtonVariant = 'primary';
  @Input() size: UiButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
}
