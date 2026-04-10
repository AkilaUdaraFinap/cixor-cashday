import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'ccd-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-header">
        @if (data.danger) { <mat-icon class="danger-icon">warning</mat-icon> }
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      <mat-dialog-content>
        <p class="confirm-message">{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button class="ccd-btn btn-secondary" [mat-dialog-close]="false">{{ data.cancelLabel ?? 'Cancel' }}</button>
        <button class="ccd-btn" [class.btn-danger]="data.danger" [class.btn-primary]="!data.danger"
          [mat-dialog-close]="true">{{ data.confirmLabel ?? 'Confirm' }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { padding: 8px; }
    .confirm-header { display: flex; align-items: center; gap: 12px; }
    .danger-icon { color: var(--ccd-danger); font-size: 28px; width: 28px; height: 28px; }
    h2 { font-size: 18px; font-weight: 700; margin: 0; color: #fff; }
    .confirm-message { font-size: 14px; color: var(--ccd-text-muted); margin: 12px 0 0; }
    mat-dialog-actions { gap: 8px; padding-bottom: 16px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
  ) {}
}
