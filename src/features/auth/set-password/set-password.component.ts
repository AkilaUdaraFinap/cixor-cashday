import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { setPassword, clearAuthError } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

function passwordsMatch(control: AbstractControl): { mismatch: boolean } | null {
  const pwd  = control.get('password')?.value;
  const conf = control.get('confirmPassword')?.value;
  return pwd && conf && pwd !== conf ? { mismatch: true } : null;
}

@Component({
  selector: 'ccd-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="auth-form">
      <h2 class="auth-title">Set your password</h2>
      <p class="auth-subtitle">Choose a strong password to secure your account</p>

      @if (error$ | async; as err) {
        <div class="auth-error">{{ err }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>New password</mat-label>
          <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="password" autocomplete="new-password" />
          <button type="button" matSuffix class="ccd-btn btn-ghost btn-sm" (click)="showPwd = !showPwd" tabindex="-1">
            <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <mat-error>Min 8 characters required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full mt-4">
          <mat-label>Confirm password</mat-label>
          <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="confirmPassword" autocomplete="new-password" />
          @if (form.errors?.['mismatch'] && form.get('confirmPassword')?.touched) {
            <mat-error>Passwords do not match</mat-error>
          }
        </mat-form-field>

        <!-- Rules -->
        <ul class="pwd-rules mt-3">
          <li [class.ok]="!form.get('password')?.hasError('minlength')">At least 8 characters</li>
        </ul>

        <button type="submit" class="ccd-btn btn-primary btn-full btn-lg mt-6"
          [disabled]="form.invalid || (loading$ | async)">
          @if (loading$ | async) { Saving… } @else { Set Password }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .auth-title    { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .auth-subtitle { font-size: 14px; color: var(--ccd-text-muted); margin-bottom: 24px; }
    .auth-error    { background: rgba(248,81,73,.12); border: 1px solid var(--ccd-danger); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: var(--ccd-danger); margin-bottom: 16px; }
    .pwd-rules { list-style: none; padding: 0; li { font-size: 12px; color: var(--ccd-text-muted); padding: 2px 0; &::before { content: '✕ '; color: var(--ccd-danger); } &.ok::before { content: '✓ '; color: var(--ccd-primary); } } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetPasswordComponent implements OnInit {
  form: FormGroup;
  showPwd = false;
  private token = '';
  loading$ = this.store.select(selectAuthLoading);
  error$   = this.store.select(selectAuthError);

  constructor(private fb: FormBuilder, private store: Store, private route: ActivatedRoute) {
    this.form = this.fb.group({
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordsMatch });
  }

  ngOnInit(): void {
    this.store.dispatch(clearAuthError());
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.store.dispatch(setPassword({
      request: {
        token: this.token,
        password: this.form.value.password,
        confirmPassword: this.form.value.confirmPassword,
      },
    }));
  }
}
