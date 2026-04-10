import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceStatus } from '../../../core/models/invoice.models';
import { InvoiceStatusLabelPipe, InvoiceStatusClassPipe } from '../../pipes/invoice-status.pipe';
import { ExpenseStatus } from '../../../core/models/expense.models';
import { UserStatus } from '../../../core/models/user.models';
import { FundingStatus } from '../../../core/models/invoice.models';

type AnyStatus = InvoiceStatus | ExpenseStatus | UserStatus | FundingStatus | string;

const STATUS_CLASS: Record<string, string> = {
  // Invoice
  Draft: 'badge-muted', Pending: 'badge-secondary', Sent: 'badge-secondary', Viewed: 'badge-secondary',
  Accepted: 'badge-success', Rejected: 'badge-danger', PartiallyPaid: 'badge-warning',
  Paid: 'badge-success', Overdue: 'badge-danger', Cancelled: 'badge-muted',
  // Expense
  Approved: 'badge-success',
  // User
  Active: 'badge-success', Inactive: 'badge-muted',
  // Funding
  None: 'badge-muted', Requested: 'badge-secondary',
  Funded: 'badge-primary', Repaid: 'badge-success',
};

@Component({
  selector: 'ccd-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="ccd-badge {{ cssClass }}">{{ label }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input() status: AnyStatus = '';
  @Input() label?: string;
  get cssClass(): string { return STATUS_CLASS[this.status] ?? 'badge-muted'; }
  get resolvedLabel(): string { return this.label ?? this.status; }
}
