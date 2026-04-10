import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { createInvoice, updateInvoice } from '../../../store/invoices/invoices.actions';
import { selectSelectedInvoice, selectInvoicesLoading } from '../../../store/invoices/invoices.selectors';
import { selectClientItems } from '../../../store/clients/clients.selectors';
import { loadClients } from '../../../store/clients/clients.actions';
import { loadInvoice } from '../../../store/invoices/invoices.actions';
import { PageHeaderComponent } from '../../../app/shared/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '../../../app/shared/components/loading-overlay/loading-overlay.component';
import { WaterfallDisplayComponent } from '../../../app/shared/components/waterfall-display/waterfall-display.component';
import { CurrencyFormatPipe } from '../../../app/shared/pipes/currency-format.pipe';
import { UiButtonComponent } from '../../../app/shared/components/ui-button/ui-button.component';
import { UiCardComponent } from '../../../app/shared/components/ui-card/ui-card.component';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';

@Component({
  selector: 'ccd-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingOverlayComponent,
    WaterfallDisplayComponent,
    CurrencyFormatPipe,
    UiButtonComponent,
    UiCardComponent,
    UiInputComponent,
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceFormComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly loading$ = this.store.select(selectInvoicesLoading);
  readonly clients$ = this.store.select(selectClientItems);
  readonly form: FormGroup;
  isEdit = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    public readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    this.form = this.fb.group({
      clientId: ['', Validators.required],
      poNumber: [''],
      issueDate: [today, Validators.required],
      dueDate: [due, Validators.required],
      serviceMonth: [''],
      notes: [''],
      paymentTerms: ['Payment due within 30 days of invoice date.'],
      lineItems: this.fb.array([this.newLine()]),
    });
  }

  ngOnInit(): void {
    this.store.dispatch(loadClients({ filter: {} }));
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id && this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (this.isEdit && id) {
      this.store.dispatch(loadInvoice({ id }));
      this.store.select(selectSelectedInvoice)
        .pipe(
          filter((invoice): invoice is NonNullable<typeof invoice> => !!invoice),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(invoice => {
          this.form.patchValue({
            clientId: invoice.clientId,
            poNumber: invoice.poNumber ?? '',
            issueDate: invoice.issueDate.slice(0, 10),
            dueDate: invoice.dueDate.slice(0, 10),
            serviceMonth: invoice.serviceMonth ?? '',
            notes: invoice.notes ?? '',
            paymentTerms: invoice.paymentTerms ?? '',
          });

          this.lineItems.clear();
          invoice.lineItems.forEach(lineItem => {
            this.lineItems.push(this.fb.group({
              description: [lineItem.description, Validators.required],
              quantity: [lineItem.quantity, [Validators.required, Validators.min(0)]],
              unitPrice: [lineItem.unitPrice, [Validators.required, Validators.min(0)]],
              taxRate: [lineItem.taxRate ?? 15],
            }));
          });
        });
    }
  }

  get lineItems(): FormArray {
    return this.form.get('lineItems') as FormArray;
  }

  getFieldError(controlName: 'clientId'): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.touched || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Select a client before continuing.';
    }

    return 'Please review this value.';
  }

  newLine(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [15],
    });
  }

  addLine(): void {
    this.lineItems.push(this.newLine());
  }

  removeLine(index: number): void {
    if (this.lineItems.length > 1) {
      this.lineItems.removeAt(index);
    }
  }

  lineTotal(control: AbstractControl): number {
    const value = control.value;
    const subtotal = (value.quantity ?? 0) * (value.unitPrice ?? 0);
    return subtotal + subtotal * ((value.taxRate ?? 0) / 100);
  }

  recalc(): void {
    this.form.updateValueAndValidity();
  }

  get subtotal(): number {
    return this.lineItems.controls.reduce((sum, control) => sum + (control.value.quantity * control.value.unitPrice), 0);
  }

  get taxTotal(): number {
    return this.lineItems.controls.reduce((sum, control) => sum + (control.value.quantity * control.value.unitPrice * (control.value.taxRate / 100)), 0);
  }

  get grossTotal(): number {
    return this.subtotal + this.taxTotal;
  }

  get netTotal(): number {
    return this.grossTotal;
  }

  get previewWaterfall(): import('../../../app/core/models/invoice.models').WaterfallBreakdown {
    return {
      gross: this.grossTotal,
      discount: 0,
      tax: this.taxTotal,
      net: this.netTotal,
      funded: 0,
      platformFee: 0,
      clientRepayment: 0,
      netPayable: this.netTotal,
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    const invoice = this.form.getRawValue();

    if (this.isEdit && id) {
      this.store.dispatch(updateInvoice({ id, invoice }));
    } else {
      this.store.dispatch(createInvoice({ invoice }));
    }
  }
}
