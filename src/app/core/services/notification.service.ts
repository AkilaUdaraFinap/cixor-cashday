import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3500): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['ccd-snack-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  error(message: string, duration = 5000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['ccd-snack-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  info(message: string, duration = 3500): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['ccd-snack-info'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  warn(message: string, duration = 4000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['ccd-snack-warn'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
