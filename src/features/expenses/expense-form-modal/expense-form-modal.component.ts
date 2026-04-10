import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';
import { createExpense, updateExpense } from '../../../store/expenses/expenses.actions';
import { selectEditingExpense } from '../../../store/expenses/expenses.selectors';
import { ExpenseCategory } from '../../../app/core/models/expense.models';
import { UiButtonComponent } from '../../../app/shared/components/ui-button/ui-button.component';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Salaries', 'Rent', 'Utilities', 'Marketing', 'Software',
  'Travel', 'Equipment', 'Professional', 'Insurance', 'Other',
];

@Component({
  selector: 'ccd-expense-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule, UiButtonComponent, UiInputComponent],
  templateUrl: './expense-form-modal.component.html',
  styleUrl: './expense-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseFormModalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = EXPENSE_CATEGORIES;
  readonly form: FormGroup;
  isEdit = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<ExpenseFormModalComponent>,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    this.form = this.fb.group({
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [today, Validators.required],
      receiptUrl: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.store.select(selectEditingExpense)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(expense => {
        if (!expense) {
          this.isEdit = false;
          return;
        }

        this.isEdit = true;
        this.form.patchValue({
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          date: expense.date.slice(0, 10),
          receiptUrl: expense.receiptUrl ?? '',
          notes: expense.notes ?? '',
        });
      });
  }

  getFieldError(controlName: 'category' | 'description' | 'amount'): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.touched || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('min')) {
      return 'Enter an amount above zero.';
    }

    if (control.hasError('maxlength')) {
      return 'Keep the description under 200 characters.';
    }

    return 'Please review this value.';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.select(selectEditingExpense).pipe(take(1)).subscribe(expense => {
      if (expense) {
        this.store.dispatch(updateExpense({ id: expense.id, expense: this.form.getRawValue() }));
      } else {
        this.store.dispatch(createExpense({ expense: this.form.getRawValue() }));
      }
    });

    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
