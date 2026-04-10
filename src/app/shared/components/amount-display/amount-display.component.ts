import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'ccd-amount',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <span class="amount"
      [class.amount-positive]="positive"
      [class.amount-negative]="negative"
      [class.amount-bold]="bold"
      [class.amount-lg]="size === 'lg'"
      [class.amount-xl]="size === 'xl'">
      {{ value | ccdCurrency:currency }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountDisplayComponent {
  @Input() value: number | null = null;
  @Input() currency = 'ZAR';
  @Input() positive = false;
  @Input() negative = false;
  @Input() bold = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
}
