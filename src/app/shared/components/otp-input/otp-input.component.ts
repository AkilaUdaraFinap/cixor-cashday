import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ccd-otp-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="otp-wrapper">
      @for (i of indices; track i) {
        <input
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="otp-box"
          [value]="digits[i]"
          [id]="'otp-' + i"
          (keydown)="onKeyDown($event, i)"
          (input)="onInput($event, i)"
          (paste)="onPaste($event)"
        />
      }
    </div>
  `,
  styles: [`
    .otp-wrapper { display: flex; gap: 10px; }
    .otp-box {
      width: 48px; height: 56px;
      text-align: center;
      font-size: 24px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      background: var(--ccd-surface-2);
      border: 2px solid var(--ccd-border);
      border-radius: 8px;
      color: var(--ccd-text);
      caret-color: var(--ccd-primary);
      outline: none;
      transition: border-color 0.15s;
      &:focus { border-color: var(--ccd-primary); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpInputComponent implements OnChanges {
  @Input() length = 6;
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() completed = new EventEmitter<string>();

  digits: string[] = [];
  indices: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['length']) {
      this.indices = Array.from({ length: this.length }, (_, i) => i);
      this.digits = Array(this.length).fill('');
    }
  }

  onKeyDown(ev: KeyboardEvent, i: number): void {
    if (ev.key === 'Backspace' && !this.digits[i] && i > 0) {
      this.focusBox(i - 1);
    }
  }

  onInput(ev: Event, i: number): void {
    const val = (ev.target as HTMLInputElement).value;
    const digit = val.replace(/\D/g, '').slice(-1);
    this.digits[i] = digit;
    this.emit();
    if (digit && i < this.length - 1) this.focusBox(i + 1);
  }

  onPaste(ev: ClipboardEvent): void {
    const pasted = ev.clipboardData?.getData('text').replace(/\D/g, '') ?? '';
    pasted.split('').slice(0, this.length).forEach((ch, idx) => this.digits[idx] = ch);
    this.emit();
    ev.preventDefault();
  }

  private emit(): void {
    const v = this.digits.join('');
    this.valueChange.emit(v);
    if (v.length === this.length) this.completed.emit(v);
  }

  private focusBox(i: number): void {
    const el = document.getElementById(`otp-${i}`);
    el?.focus();
  }
}
