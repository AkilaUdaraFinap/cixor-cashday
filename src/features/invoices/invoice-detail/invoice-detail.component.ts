import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { loadInvoice, sendInvoice, requestFunding, deleteInvoice, updateInvoice } from '../../../store/invoices/invoices.actions';
import { selectSelectedInvoice, selectInvoicesLoading } from '../../../store/invoices/invoices.selectors';
import { InvoiceStatus } from '../../../app/core/models/invoice.models';
import { StatusBadgeComponent } from '../../../app/shared/components/status-badge/status-badge.component';
import { WaterfallDisplayComponent } from '../../../app/shared/components/waterfall-display/waterfall-display.component';
import { AmountDisplayComponent } from '../../../app/shared/components/amount-display/amount-display.component';
import { LoadingOverlayComponent } from '../../../app/shared/components/loading-overlay/loading-overlay.component';
import { PageHeaderComponent } from '../../../app/shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../app/shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyFormatPipe } from '../../../app/shared/pipes/currency-format.pipe';

const STATUS_STEPS: InvoiceStatus[] = ['Draft', 'Sent', 'Accepted', 'Paid'];

@Component({
  selector: 'ccd-invoice-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule,
    StatusBadgeComponent, WaterfallDisplayComponent, AmountDisplayComponent,
    LoadingOverlayComponent, PageHeaderComponent, CurrencyFormatPipe,
  ],
  template: `
    @if (loading$ | async) {
      <ccd-loading [loading]="true" />
    }
    @if (invoice$ | async; as inv) {
      <ccd-page-header [title]="inv.invoiceNumber" [subtitle]="inv.clientName" backRoute="/invoices">
        <div class="flex gap-3">
          @if (inv.status === 'Draft') {
            <a [routerLink]="['/invoices', inv.id, 'edit']" class="ccd-btn btn-ghost">
              <mat-icon>edit</mat-icon> Edit
            </a>
            <button class="ccd-btn btn-primary" (click)="onSend(inv)">
              <mat-icon>send</mat-icon> Send to Client
            </button>
          }
          @if (inv.status === 'Sent' && inv.fundingStatus === 'None') {
            <button class="ccd-btn btn-primary" (click)="onRequestFunding(inv)">
              <mat-icon>account_balance</mat-icon> Request Funding
            </button>
          }
          @if (inv.status === 'Accepted' || inv.status === 'Sent') {
            <button class="ccd-btn btn-success" (click)="onMarkPaid(inv)">
              <mat-icon>check_circle</mat-icon> Mark Paid
            </button>
          }
          @if (inv.status === 'Draft') {
            <button class="ccd-btn btn-danger-outline" (click)="onDelete(inv)">
              <mat-icon>delete</mat-icon> Delete
            </button>
          }
        </div>
      </ccd-page-header>

      <!-- Status timeline -->
      <div class="ccd-card mb-4">
        <div class="status-timeline">
          @for (step of statusSteps; track step; let i = $index) {
            <div class="step" [class.done]="isStepDone(step, inv.status)" [class.active]="inv.status === step">
              <div class="step-circle">
                @if (isStepDone(step, inv.status)) { <mat-icon>check</mat-icon> }
                @else { <span>{{ i + 1 }}</span> }
              </div>
              <div class="step-label">{{ step }}</div>
              @if (i < statusSteps.length - 1) { <div class="step-line" [class.filled]="isStepDone(step, inv.status)"></div> }
            </div>
          }
        </div>
      </div>

      <div class="detail-grid">
        <!-- Left: Details -->
        <div>
          <!-- Invoice info -->
          <div class="ccd-card mb-4">
            <div class="card-title mb-4">Invoice Information</div>
            <div class="info-grid">
              <div class="info-row"><span class="info-label">Client</span><span>{{ inv.clientName }}</span></div>
              <div class="info-row"><span class="info-label">PO Number</span><span>{{ inv.poNumber || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Issue Date</span><span>{{ inv.issueDate | date:'d MMM y' }}</span></div>
              <div class="info-row"><span class="info-label">Due Date</span><span>{{ inv.dueDate | date:'d MMM y' }}</span></div>
              <div class="info-row"><span class="info-label">Service Month</span><span>{{ inv.serviceMonth || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Status</span><ccd-status-badge [status]="inv.status" /></div>
              <div class="info-row"><span class="info-label">Funding</span><ccd-status-badge [status]="inv.fundingStatus" /></div>
            </div>
          </div>

          <!-- Line items -->
          <div class="ccd-card mb-4">
            <div class="card-title mb-4">Line Items</div>
            <div class="ccd-table-container">
              <table class="ccd-table">
                <thead>
                  <tr>
                    <th>Description</th><th class="text-right">Qty</th>
                    <th class="text-right">Unit Price</th><th class="text-right">Tax</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of inv.lineItems; track line.id) {
                    <tr>
                      <td>{{ line.description }}</td>
                      <td class="mono text-right">{{ line.quantity }}</td>
                      <td class="mono text-right">{{ line.unitPrice | ccdCurrency }}</td>
                      <td class="mono text-right">{{ line.taxAmount | ccdCurrency }}</td>
                      <td class="mono text-right">{{ line.lineTotal | ccdCurrency }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          @if (inv.notes) {
            <div class="ccd-card mb-4">
              <div class="card-title mb-2">Notes</div>
              <p class="text-muted text-sm">{{ inv.notes }}</p>
            </div>
          }
        </div>

        <!-- Right: Waterfall + Amounts -->
        <div>
          <div class="ccd-card">
            <div class="card-title mb-4">Amount Breakdown</div>
            <ccd-waterfall [breakdown]="inv.waterfall ?? null" />
            <div class="summary-totals mt-4">
              <div class="summary-row"><span>Subtotal</span><span class="mono">{{ inv.subtotal | ccdCurrency }}</span></div>
              <div class="summary-row"><span>Tax</span><span class="mono">{{ inv.taxTotal | ccdCurrency }}</span></div>
              <div class="summary-row total-row"><span>Total</span><span class="mono primary">{{ inv.totalAmount | ccdCurrency }}</span></div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .status-timeline { display: flex; align-items: center; gap: 0; overflow-x: auto; }
    .step { display: flex; flex-direction: column; align-items: center; min-width: 90px; position: relative; flex: 1; }
    .step-circle { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--ccd-border); background: var(--ccd-surface-2); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--ccd-text-muted); z-index: 1; mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .step.done .step-circle { background: var(--ccd-primary); border-color: var(--ccd-primary); color: #000; }
    .step.active .step-circle { border-color: var(--ccd-primary); color: var(--ccd-primary); }
    .step-label { font-size: 11px; margin-top: 6px; color: var(--ccd-text-muted); font-weight: 600; }
    .step.active .step-label { color: var(--ccd-primary); }
    .step-line { position: absolute; top: 15px; left: calc(50% + 16px); width: calc(100% - 32px); height: 2px; background: var(--ccd-border); z-index: 0; &.filled { background: var(--ccd-primary); } }
    .detail-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
    .info-grid { display: flex; flex-direction: column; gap: 10px; }
    .info-row { display: flex; align-items: center; gap: 12px; font-size: 14px; }
    .info-label { color: var(--ccd-text-muted); width: 120px; flex-shrink: 0; font-weight: 500; }
    .summary-totals { border-top: 1px solid var(--ccd-border); padding-top: 14px; display: flex; flex-direction: column; gap: 8px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--ccd-text-muted); }
    .total-row { font-size: 18px; font-weight: 700; color: var(--ccd-text) !important; margin-top: 4px; }
    .primary { color: var(--ccd-primary); }
    .text-right { text-align: right; }
    @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailComponent implements OnInit {
  invoice$ = this.store.select(selectSelectedInvoice);
  loading$ = this.store.select(selectInvoicesLoading);
  statusSteps = STATUS_STEPS;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    public router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.dispatch(loadInvoice({ id }));
  }

  isStepDone(step: InvoiceStatus, current: InvoiceStatus): boolean {
    const si = STATUS_STEPS.indexOf(step);
    const ci = STATUS_STEPS.indexOf(current);
    return si < ci;
  }

  onSend(inv: { id: string; invoiceNumber: string }): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Send Invoice', message: `Send ${inv.invoiceNumber} to the client for acceptance?` } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => { if (ok) this.store.dispatch(sendInvoice({ id: inv.id })); });
  }

  onRequestFunding(inv: { id: string; invoiceNumber: string }): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Request Funding', message: `Request funding for invoice ${inv.invoiceNumber}?` } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => { if (ok) this.store.dispatch(requestFunding({ id: inv.id })); });
  }

  onMarkPaid(inv: { id: string; invoiceNumber: string }): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Mark as Paid', message: `Confirm ${inv.invoiceNumber} has been paid?` } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => { if (ok) this.store.dispatch(updateInvoice({ id: inv.id, invoice: { status: 'Paid' } })); });
  }

  onDelete(inv: { id: string; invoiceNumber: string }): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Invoice', message: `Delete ${inv.invoiceNumber}? This cannot be undone.`, danger: true } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => { if (ok) this.store.dispatch(deleteInvoice({ id: inv.id })); });
  }
}
