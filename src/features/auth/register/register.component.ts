import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { register, clearAuthError } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError, selectRegisterSuccess } from '../../../store/auth/auth.selectors';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';

@Component({
  selector: 'ccd-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, UiInputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  readonly totalSteps = 4;
  readonly steps = [
    { id: 1, label: 'Business' },
    { id: 2, label: 'Admin' },
    { id: 3, label: 'Defaults' },
    { id: 4, label: 'Review' },
  ];

  readonly form: FormGroup = this.fb.group({
    businessSearch: ['', Validators.required],
    businessName: ['', Validators.required],
    registrationNumber: ['', Validators.required],
    industry: ['Financial Services', Validators.required],
    teamSize: ['1-10', Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['Admin', Validators.required],
    currency: ['ZAR', Validators.required],
    locale: ['en-ZA', Validators.required],
    paymentTerms: [30, [Validators.required, Validators.min(1)]],
    invoiceVolume: ['1-20', Validators.required],
    agreeTerms: [false, Validators.requiredTrue],
  });

  readonly loading$ = this.store.select(selectAuthLoading);
  readonly error$ = this.store.select(selectAuthError);
  readonly success$ = this.store.select(selectRegisterSuccess);

  currentStep = 1;
  lookupPreview = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(clearAuthError());
  }

  goToStep(step: number): void {
    if (step < this.currentStep || this.isStepValid(step - 1)) {
      this.currentStep = Math.max(1, Math.min(step, this.totalSteps));
    }
  }

  nextStep(): void {
    if (!this.isStepValid(this.currentStep)) {
      this.markStepTouched(this.currentStep);
      return;
    }

    if (this.currentStep === 1) {
      this.applyBusinessLookup();
    }

    this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
  }

  previousStep(): void {
    this.currentStep = Math.max(1, this.currentStep - 1);
  }

  applyBusinessLookup(): void {
    const search = String(this.form.get('businessSearch')?.value ?? '').trim();
    if (!search) {
      return;
    }

    if (!this.form.get('businessName')?.value) {
      this.form.patchValue({ businessName: search });
    }

    if (!this.form.get('registrationNumber')?.value) {
      this.form.patchValue({ registrationNumber: '2025/123456/07' });
    }

    this.lookupPreview = `Suggested business profile prepared for ${search}.`;
  }

  getFieldError(controlName: string): string | null {
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

    if (control.hasError('requiredTrue')) {
      return 'Please confirm to continue.';
    }

    if (control.hasError('min')) {
      return 'Use a value greater than zero.';
    }

    return 'Please review this field.';
  }

  onSubmit(): void {
    if (!this.isStepValid(this.totalSteps)) {
      this.markStepTouched(this.totalSteps);
      return;
    }

    this.store.dispatch(register({
      request: {
        name: this.form.get('name')?.value,
        email: this.form.get('email')?.value,
        businessName: this.form.get('businessName')?.value,
        phone: this.form.get('phone')?.value,
      },
    }));
  }

  private isStepValid(step: number): boolean {
    if (step <= 0) {
      return true;
    }

    return this.getStepControls(step).every(controlName => this.form.get(controlName)?.valid);
  }

  private markStepTouched(step: number): void {
    this.getStepControls(step).forEach(controlName => this.form.get(controlName)?.markAsTouched());
  }

  private getStepControls(step: number): string[] {
    switch (step) {
      case 1:
        return ['businessSearch', 'businessName', 'registrationNumber', 'industry', 'teamSize'];
      case 2:
        return ['name', 'email', 'role'];
      case 3:
        return ['currency', 'locale', 'paymentTerms', 'invoiceVolume'];
      case 4:
        return ['agreeTerms'];
      default:
        return [];
    }
  }
}
