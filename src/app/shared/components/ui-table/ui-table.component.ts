import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ccd-ui-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="ccd-ui-table-shell" [attr.aria-label]="ariaLabel || title">
      @if (title || subtitle) {
        <header class="ccd-ui-table-shell__header">
          <div>
            @if (title) {
              <h2 class="card-title">{{ title }}</h2>
            }
            @if (subtitle) {
              <p class="ccd-ui-table-shell__subtitle">{{ subtitle }}</p>
            }
          </div>
          <div class="ccd-ui-table-shell__actions">
            <ng-content select="[table-actions]" />
          </div>
        </header>
      }

      <div class="ccd-ui-table-shell__content">
        <ng-content />
      </div>

      <footer class="ccd-ui-table-shell__footer">
        <ng-content select="[table-footer]" />
      </footer>
    </section>
  `,
  styles: [`
    .ccd-ui-table-shell {
      display: block;
      background: var(--ccd-surface-1);
      border: 1px solid var(--ccd-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .ccd-ui-table-shell__header,
    .ccd-ui-table-shell__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
    }

    .ccd-ui-table-shell__header {
      border-bottom: 1px solid var(--ccd-border);
    }

    .ccd-ui-table-shell__footer {
      border-top: 1px solid var(--ccd-border);
      color: var(--ccd-text-muted);
    }

    .ccd-ui-table-shell__subtitle {
      margin-top: var(--space-1);
      color: var(--ccd-text-muted);
      font-size: var(--text-sm);
    }

    .ccd-ui-table-shell__actions {
      display: inline-flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .ccd-ui-table-shell__content {
      overflow: auto;
    }

    .ccd-ui-table-shell__footer:empty {
      display: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() ariaLabel = '';
}
