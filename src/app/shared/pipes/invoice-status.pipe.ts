import { Pipe, PipeTransform } from '@angular/core';
import { InvoiceStatus } from '../../core/models/invoice.models';

const LABELS: Record<InvoiceStatus, string> = {
  Draft: 'Draft',
  Pending: 'Pending',
  Sent: 'Sent',
  Viewed: 'Viewed',
  Accepted: 'Accepted',
  Rejected: 'Rejected',
  PartiallyPaid: 'Part. Paid',
  Paid: 'Paid',
  Overdue: 'Overdue',
  Cancelled: 'Cancelled',
};

const CSS_CLASS: Record<InvoiceStatus, string> = {
  Draft: 'badge-muted',
  Pending: 'badge-secondary',
  Sent: 'badge-secondary',
  Viewed: 'badge-secondary',
  Accepted: 'badge-success',
  Rejected: 'badge-danger',
  PartiallyPaid: 'badge-warning',
  Paid: 'badge-success',
  Overdue: 'badge-danger',
  Cancelled: 'badge-muted',
};

@Pipe({ name: 'invoiceStatusLabel', standalone: true })
export class InvoiceStatusLabelPipe implements PipeTransform {
  transform(status: InvoiceStatus): string { return LABELS[status] ?? status; }
}

@Pipe({ name: 'invoiceStatusClass', standalone: true })
export class InvoiceStatusClassPipe implements PipeTransform {
  transform(status: InvoiceStatus): string { return CSS_CLASS[status] ?? 'badge-muted'; }
}
