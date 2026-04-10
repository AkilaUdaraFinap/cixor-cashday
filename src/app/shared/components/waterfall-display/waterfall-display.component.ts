import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { WaterfallBreakdown } from '../../../core/models/invoice.models';

@Component({
  selector: 'ccd-waterfall',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    @if (breakdown) {
      <div class="waterfall">
        <div class="waterfall-row waterfall-gross">
          <div class="wf-label">Gross Invoice Amount</div>
          <div class="wf-amount">{{ breakdown.gross | ccdCurrency }}</div>
        </div>
        @if (breakdown.discount) {
          <div class="waterfall-row waterfall-deduct">
            <div class="wf-label"><span class="wf-indent">− Discount</span></div>
            <div class="wf-amount negative">({{ breakdown.discount | ccdCurrency }})</div>
          </div>
        }
        <div class="waterfall-row">
          <div class="wf-label"><span class="wf-indent">+ VAT / Tax</span></div>
          <div class="wf-amount">{{ breakdown.tax | ccdCurrency }}</div>
        </div>
        <div class="waterfall-row waterfall-subtotal">
          <div class="wf-label">Net Invoice Value</div>
          <div class="wf-amount bold">{{ breakdown.net | ccdCurrency }}</div>
        </div>
        @if (breakdown.funded) {
          <div class="waterfall-row waterfall-funded">
            <div class="wf-label"><span class="wf-indent">Funded Amount</span></div>
            <div class="wf-amount primary">{{ breakdown.funded | ccdCurrency }}</div>
          </div>
          <div class="waterfall-row waterfall-deduct">
            <div class="wf-label"><span class="wf-indent">− Platform Fee</span></div>
            <div class="wf-amount negative">({{ breakdown.platformFee | ccdCurrency }})</div>
          </div>
          <div class="waterfall-row waterfall-deduct">
            <div class="wf-label"><span class="wf-indent">− Client Repayment</span></div>
            <div class="wf-amount negative">({{ breakdown.clientRepayment | ccdCurrency }})</div>
          </div>
        }
        <div class="waterfall-row waterfall-net">
          <div class="wf-label">Net Payable to You</div>
          <div class="wf-amount bold primary">{{ breakdown.netPayable | ccdCurrency }}</div>
        </div>
      </div>
    }
  `,
  styles: [`
    .waterfall { display: flex; flex-direction: column; gap: 4px; }
    .waterfall-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; border-radius: 6px; }
    .waterfall-gross { background: rgba(255,255,255,.04); }
    .waterfall-subtotal { border-top: 1px solid var(--ccd-border); margin-top: 4px; padding-top: 10px; }
    .waterfall-net { background: rgba(0,201,167,.08); border: 1px solid rgba(0,201,167,.2); margin-top: 4px; }
    .wf-label { font-size: 13px; color: var(--ccd-text-muted); }
    .wf-indent { padding-left: 16px; }
    .wf-amount { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--ccd-text); }
    .wf-amount.negative { color: var(--ccd-danger); }
    .wf-amount.primary  { color: var(--ccd-primary); }
    .wf-amount.bold     { font-weight: 700; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallDisplayComponent {
  @Input() breakdown: WaterfallBreakdown | null = null;
}
