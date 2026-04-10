import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  loadInvoices, deleteInvoice, sendInvoice, requestFunding, setInvoiceFilter,
} from '../../../store/invoices/invoices.actions';
import {
  selectInvoiceItems, selectInvoicesLoading, selectInvoicesTotal, selectInvoiceFilter,
} from '../../../store/invoices/invoices.selectors';
import { InvoiceStatus, InvoiceListItem } from '../../../app/core/models/invoice.models';
import { StatusBadgeComponent } from '../../../app/shared/components/status-badge/status-badge.component';
import { LoadingOverlayComponent } from '../../../app/shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../../app/shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../app/shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../app/shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyFormatPipe } from '../../../app/shared/pipes/currency-format.pipe';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';
import { UiTableComponent } from '../../../app/shared/components/ui-table/ui-table.component';
import { CcdRoleDirective } from '../../../app/shared/directives/ccd-role.directive';

@Component({
  selector: 'ccd-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    StatusBadgeComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    CurrencyFormatPipe,
    UiInputComponent,
    UiTableComponent,
    CcdRoleDirective,
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly Math = Math;
  readonly invoices$ = this.store.select(selectInvoiceItems);
  readonly loading$ = this.store.select(selectInvoicesLoading);
  readonly total$ = this.store.select(selectInvoicesTotal);
  readonly filter$ = this.store.select(selectInvoiceFilter);

  page = 1;
  pageSize = 20;

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly fromDateCtrl = new FormControl('', { nonNullable: true });
  readonly toDateCtrl = new FormControl('', { nonNullable: true });
  private currentFilter: { search?: string; status?: InvoiceStatus; fromDate?: string; toDate?: string; page?: number; pageSize?: number } = {};

  readonly statusOptions: { value: InvoiceStatus | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Overdue', label: 'Overdue' },
  ];

  constructor(
    private readonly store: Store,
    public readonly router: Router,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.reloadInvoices();

    this.searchCtrl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        this.currentFilter.search = query || undefined;
        this.page = 1;
        this.reloadInvoices();
      });

    this.fromDateCtrl.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.currentFilter.fromDate = value || undefined;
        this.page = 1;
        this.reloadInvoices();
      });

    this.toDateCtrl.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.currentFilter.toDate = value || undefined;
        this.page = 1;
        this.reloadInvoices();
      });
  }

  setStatus(status: InvoiceStatus | undefined): void {
    this.currentFilter.status = status;
    this.page = 1;
    this.reloadInvoices();
  }

  clearFilters(): void {
    this.currentFilter = {};
    this.page = 1;
    this.searchCtrl.setValue('', { emitEvent: false });
    this.fromDateCtrl.setValue('', { emitEvent: false });
    this.toDateCtrl.setValue('', { emitEvent: false });
    this.reloadInvoices();
  }

  isOverdue(inv: InvoiceListItem): boolean {
    return new Date(inv.dueDate) < new Date() && inv.status !== 'Paid';
  }

  prevPage(): void {
    this.page--;
    this.reloadInvoices();
  }

  nextPage(): void {
    this.page++;
    this.reloadInvoices();
  }

  onSend(inv: InvoiceListItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Send Invoice', message: `Send invoice ${inv.invoiceNumber} to the client?` } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => { if (ok) this.store.dispatch(sendInvoice({ id: inv.id })); });
  }

  onRequestFunding(inv: InvoiceListItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Request Funding', message: `Request funding for ${inv.invoiceNumber}?` } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => { if (ok) this.store.dispatch(requestFunding({ id: inv.id })); });
  }

  onDelete(inv: InvoiceListItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Invoice', message: `Permanently delete ${inv.invoiceNumber}? This cannot be undone.`, danger: true } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => { if (ok) this.store.dispatch(deleteInvoice({ id: inv.id })); });
  }

  private reloadInvoices(): void {
    const filter = {
      ...this.currentFilter,
      page: this.page,
      pageSize: this.pageSize,
    };

    this.store.dispatch(setInvoiceFilter({ filter }));
    this.store.dispatch(loadInvoices({ filter }));
  }
}
