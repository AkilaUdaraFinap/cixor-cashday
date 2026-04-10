import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ccd-ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="ccd-card ccd-ui-card" [class.ccd-ui-card--elevated]="elevated">
      @if (title || subtitle) {
        <header class="ccd-ui-card__header">
          <div>
            @if (title) {
              <h2 class="card-title">{{ title }}</h2>
            }
            @if (subtitle) {
              <p class="ccd-ui-card__subtitle">{{ subtitle }}</p>
            }
          </div>
          <div class="ccd-ui-card__actions">
            <ng-content select="[card-actions]" />
          </div>
        </header>
      }

      <div class="ccd-ui-card__body">
        <ng-content />
      </div>
    </section>
  `,
  styles: [`
    .ccd-ui-card {
      display: block;
    }

    .ccd-ui-card--elevated {
      box-shadow: var(--shadow-md);
    }

    .ccd-ui-card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .ccd-ui-card__subtitle {
      margin-top: var(--space-1);
      color: var(--ccd-text-muted);
      font-size: var(--text-sm);
    }

    .ccd-ui-card__actions {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() elevated = false;
}
