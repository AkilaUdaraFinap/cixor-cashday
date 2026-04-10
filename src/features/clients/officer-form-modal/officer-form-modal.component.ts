import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { addOfficer, updateOfficer } from '../../../store/clients/clients.actions';
import { UiButtonComponent } from '../../../app/shared/components/ui-button/ui-button.component';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';

@Component({
  selector: 'ccd-officer-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule, UiButtonComponent, UiInputComponent],
  templateUrl: './officer-form-modal.component.html',
  styleUrl: './officer-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficerFormModalComponent implements OnInit {
  readonly form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<OfficerFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clientId: string; officer?: any },
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      title: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      idNumber: [''],
    });
  }

  ngOnInit(): void {
    const officer = this.data.officer;
    if (!officer) {
      return;
    }

    this.form.patchValue({
      firstName: officer.firstName ?? '',
      lastName: officer.lastName ?? '',
      title: officer.title ?? '',
      email: officer.email ?? '',
      phone: officer.phone ?? '',
      idNumber: officer.idNumber ?? '',
    });
  }

  getFieldError(controlName: 'firstName' | 'lastName' | 'email'): string | null {
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

    if (this.data.officer) {
      this.store.dispatch(updateOfficer({ clientId: this.data.clientId, officerId: this.data.officer.id, data: this.form.getRawValue() }));
    } else {
      this.store.dispatch(addOfficer({ clientId: this.data.clientId, officer: this.form.getRawValue() }));
    }

    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
