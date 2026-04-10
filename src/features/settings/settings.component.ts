import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { PageHeaderComponent } from '../../app/shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../app/shared/components/ui-card/ui-card.component';
import { UiButtonComponent } from '../../app/shared/components/ui-button/ui-button.component';
import { UiInputComponent } from '../../app/shared/components/ui-input/ui-input.component';
import { ThemeService, AppTheme } from '../../app/core/services/theme.service';
import { WorkspacePreferencesService } from '../../app/core/services/workspace-preferences.service';

@Component({
  selector: 'ccd-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, UiButtonComponent, UiInputComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly user$ = this.store.select(selectAuthUser);
  readonly profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [''],
    phone: [''],
  });
  readonly companyForm: FormGroup = this.fb.group({
    businessName: ['', Validators.required],
    registrationNumber: ['', Validators.required],
    country: ['South Africa', Validators.required],
    vatNumber: [''],
    defaultCurrency: ['ZAR', Validators.required],
    locale: ['en-ZA', Validators.required],
    paymentTerms: [30, [Validators.required, Validators.min(1)]],
  });
  readonly appearanceForm: FormGroup = this.fb.group({
    theme: ['light', Validators.required],
  });
  readonly templateForm: FormGroup = this.fb.group({
    invoicePrefix: ['INV', Validators.required],
    footerNote: ['Payment due according to agreed terms.'],
    reminderCadence: ['7 days before due date', Validators.required],
    includeBankDetails: [true],
  });
  readonly passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.confirmMatch },
  );
  readonly notifForm: FormGroup;

  readonly notifPrefs = [
    { key: 'invoicePaid', label: 'Invoice paid', desc: 'Notify when a client marks an invoice as paid.' },
    { key: 'invoiceOverdue', label: 'Invoice overdue', desc: 'Notify when an invoice becomes overdue.' },
    { key: 'expenseApproved', label: 'Expense approved', desc: 'Notify when an expense is approved or rejected.' },
    { key: 'fundingUpdate', label: 'Funding updates', desc: 'Notify on funding status changes.' },
    { key: 'userActivity', label: 'User activity', desc: 'Notify on new user logins for admins.' },
  ];

  readonly countryPresets: Record<string, { currency: string; locale: string }> = {
    'South Africa': { currency: 'ZAR', locale: 'en-ZA' },
    'Sri Lanka': { currency: 'LKR', locale: 'en-LK' },
    'Singapore': { currency: 'SGD', locale: 'en-SG' },
    'United Kingdom': { currency: 'GBP', locale: 'en-GB' },
    'United States': { currency: 'USD', locale: 'en-US' },
  };

  readonly themeOptions: Array<{ value: AppTheme; label: string; description: string }> = [
    { value: 'light', label: 'Light', description: 'Bright operational workspace.' },
    { value: 'dark', label: 'Dark', description: 'Low-glare contrast theme for extended use.' },
    { value: 'cashday-classic', label: 'CashDay Classic', description: 'Official CCD navy, gold, and cyan brand palette.' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly snack: MatSnackBar,
    private readonly theme: ThemeService,
    private readonly preferences: WorkspacePreferencesService,
  ) {
    const notifControls: Record<string, boolean> = {};
    this.notifPrefs.forEach(pref => {
      notifControls[pref.key] = true;
    });
    this.notifForm = this.fb.group(notifControls);
  }

  ngOnInit(): void {
    const workspacePrefs = this.preferences.preferences();

    this.appearanceForm.patchValue({
      theme: this.theme.theme(),
    });

    this.companyForm.get('country')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(country => {
        const preset = this.countryPresets[country as string];
        if (preset) {
          this.companyForm.patchValue({
            defaultCurrency: preset.currency,
            locale: preset.locale,
          }, { emitEvent: false });
        }
      });

    this.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (!user) {
          return;
        }

        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: (user as { phone?: string }).phone ?? '',
        });

        this.companyForm.patchValue({
          businessName: user.businessName,
          registrationNumber: '2025/123456/07',
          country: workspacePrefs.country,
          vatNumber: '4123456789',
          defaultCurrency: workspacePrefs.currency,
          locale: workspacePrefs.locale,
          paymentTerms: 30,
        });
      });
  }

  getProfileError(controlName: 'firstName' | 'lastName'): string | null {
    const control = this.profileForm.get(controlName);
    if (!control || !control.touched || !control.invalid) {
      return null;
    }

    return 'This field is required.';
  }

  getPasswordError(controlName: 'currentPassword' | 'newPassword' | 'confirmPassword'): string | null {
    const control = this.passwordForm.get(controlName);
    if (!control || !control.touched || !control.invalid) {
      if (controlName === 'confirmPassword' && this.passwordForm.hasError('mismatch') && control?.touched) {
        return 'Passwords do not match.';
      }
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('minlength')) {
      return 'Use at least 8 characters.';
    }

    return 'Please review this value.';
  }

  confirmMatch(group: AbstractControl) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  saveProfile(): void {
    this.snack.open('Profile updated', 'Dismiss', { duration: 3000, panelClass: 'snack-success' });
    this.profileForm.markAsPristine();
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.preferences.updateCompanyPreferences({
      country: this.companyForm.get('country')?.value,
      currency: this.companyForm.get('defaultCurrency')?.value,
      locale: this.companyForm.get('locale')?.value,
    });

    this.snack.open('Company configuration saved', 'Dismiss', { duration: 3000, panelClass: 'snack-success' });
    this.companyForm.markAsPristine();
  }

  saveAppearance(): void {
    const theme = this.appearanceForm.get('theme')?.value as AppTheme;
    this.theme.setTheme(theme);
    this.snack.open('Theme updated', 'Dismiss', { duration: 3000, panelClass: 'snack-success' });
    this.appearanceForm.markAsPristine();
  }

  saveTemplates(): void {
    this.snack.open('Invoice template defaults updated', 'Dismiss', { duration: 3000, panelClass: 'snack-success' });
    this.templateForm.markAsPristine();
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.snack.open('Password changed successfully', 'Dismiss', { duration: 3000, panelClass: 'snack-success' });
    this.passwordForm.reset();
  }

  saveNotifications(): void {
    this.snack.open('Notification preferences saved', 'Dismiss', { duration: 3000, panelClass: 'snack-success' });
    this.notifForm.markAsPristine();
  }
}
