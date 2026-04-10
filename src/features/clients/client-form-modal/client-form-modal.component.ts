import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { createClient, updateClient } from '../../../store/clients/clients.actions';
import { UiButtonComponent } from '../../../app/shared/components/ui-button/ui-button.component';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';

@Component({
  selector: 'ccd-client-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule, UiButtonComponent, UiInputComponent],
  templateUrl: './client-form-modal.component.html',
  styleUrl: './client-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFormModalComponent implements OnInit {
  readonly form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<ClientFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client?: any } | null,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      vatNumber: [''],
      creditLimit: [null],
      address: [''],
      website: [''],
    });
  }

  ngOnInit(): void {
    const client = this.data?.client;
    if (!client) {
      return;
    }

    this.form.patchValue({
      name: client.name ?? '',
      registrationNumber: client.registrationNumber ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      vatNumber: client.vatNumber ?? '',
      creditLimit: client.creditLimit ?? null,
      address: client.address ?? '',
      website: client.website ?? '',
    });
  }

  getFieldError(controlName: 'name' | 'registrationNumber' | 'email'): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.touched || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    return 'Please review this value.';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.data?.client) {
      this.store.dispatch(updateClient({ id: this.data.client.id, client: this.form.getRawValue() }));
    } else {
      this.store.dispatch(createClient({ client: this.form.getRawValue() }));
    }

    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
