import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';
import { createUser, updateUser } from '../../../store/users/users.actions';
import { selectEditingUser } from '../../../store/users/users.selectors';
import { UserRole } from '../../../app/core/models/user.models';
import { UiButtonComponent } from '../../../app/shared/components/ui-button/ui-button.component';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';

const USER_ROLES: UserRole[] = ['SuperAdmin', 'Admin', 'AccountsManager', 'Viewer'];

@Component({
  selector: 'ccd-user-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule, UiButtonComponent, UiInputComponent],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormModalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['AccountsManager', Validators.required],
  });
  readonly roles = USER_ROLES;
  isEdit = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<UserFormModalComponent>,
  ) {}

  ngOnInit(): void {
    this.store.select(selectEditingUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (!user) {
          this.isEdit = false;
          return;
        }

        this.isEdit = true;
        this.form.patchValue({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
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

    this.store.select(selectEditingUser).pipe(take(1)).subscribe(user => {
      if (user) {
        this.store.dispatch(updateUser({ id: user.id, data: this.form.getRawValue() }));
      } else {
        this.store.dispatch(createUser({ data: this.form.getRawValue() }));
      }
    });

    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
