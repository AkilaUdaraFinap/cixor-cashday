import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ccd-ui-input',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
  template: `
    <label class="ccd-field" [attr.for]="inputId">
      @if (label) {
        <span class="ccd-field__label">{{ label }}</span>
      }

      <span class="ccd-field__control" [class.ccd-field__control--error]="!!error">
        @if (icon) {
          <mat-icon class="ccd-field__icon">{{ icon }}</mat-icon>
        }

        <input
          class="ccd-field__input"
          [id]="inputId"
          [type]="resolvedType"
          [value]="value"
          [placeholder]="placeholder"
          [attr.autocomplete]="autocomplete"
          [attr.inputmode]="inputMode"
          [disabled]="disabled"
          [readOnly]="readonly"
          [attr.aria-invalid]="!!error"
          [attr.aria-describedby]="describedBy"
          (input)="onInput($event)"
          (blur)="markTouched()"
        />

        @if (showPasswordToggle && type === 'password') {
          <button
            type="button"
            class="ccd-field__toggle"
            [attr.aria-label]="passwordVisible ? 'Hide password' : 'Show password'"
            (click)="togglePasswordVisibility()"
          >
            <mat-icon>{{ passwordVisible ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        }
      </span>

      @if (hint && !error) {
        <span class="ccd-field__hint" [id]="hintId">{{ hint }}</span>
      }

      @if (error) {
        <span class="ccd-field__error" [id]="errorId" role="alert">{{ error }}</span>
      }
    </label>
  `,
  styles: [`
    .ccd-field {
      display: grid;
      gap: var(--space-2);
    }

    .ccd-field__label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--ccd-text);
    }

    .ccd-field__control {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 48px;
      overflow: hidden;
      border: 1px solid var(--ccd-border);
      border-radius: var(--radius-md);
      background: var(--ccd-surface-2);
      padding: 0 var(--space-3);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
    }

    .ccd-field__control:focus-within {
      border-color: var(--ccd-primary);
      box-shadow: 0 0 0 3px var(--ccd-ring);
      background: var(--ccd-surface-raised);
    }

    .ccd-field__control--error,
    .ccd-field__control--error:focus-within {
      border-color: var(--ccd-danger);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.14);
    }

    .ccd-field__icon,
    .ccd-field__toggle {
      color: var(--ccd-text-muted);
      flex-shrink: 0;
    }

    .ccd-field__toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: transparent;
      cursor: pointer;
      padding: 0;
    }

    .ccd-field__input {
      width: 100%;
      border: 0;
      outline: 0;
      box-shadow: none !important;
      background: transparent;
      color: var(--ccd-text);
      font: inherit;
    }

    .ccd-field__input:focus,
    .ccd-field__input:focus-visible {
      outline: none;
      box-shadow: none !important;
    }

    .ccd-field__input::placeholder {
      color: var(--ccd-text-muted);
    }

    .ccd-field__hint,
    .ccd-field__error {
      font-size: var(--text-xs);
    }

    .ccd-field__hint {
      color: var(--ccd-text-muted);
    }

    .ccd-field__error {
      color: var(--ccd-danger);
      font-weight: 600;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() placeholder = '';
  @Input() autocomplete = 'off';
  @Input() inputMode = 'text';
  @Input() hint = '';
  @Input() readonly = false;
  @Input() error: string | null = null;
  @Input() icon = '';
  @Input() inputId = `ccd-input-${Math.random().toString(36).slice(2, 10)}`;
  @Input() showPasswordToggle = false;

  value = '';
  disabled = false;
  passwordVisible = false;

  private onChange: (value: string | number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get resolvedType(): string {
    return this.type === 'password' && this.passwordVisible ? 'text' : this.type;
  }

  get hintId(): string {
    return `${this.inputId}-hint`;
  }

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  get describedBy(): string | null {
    if (this.error) {
      return this.errorId;
    }

    return this.hint ? this.hintId : null;
  }

  writeValue(value: string | number | null): void {
    this.value = value == null ? '' : String(value);
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value;

    this.value = rawValue;
    this.onChange(this.type === 'number' ? (rawValue === '' ? null : Number(rawValue)) : rawValue);
  }

  markTouched(): void {
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
