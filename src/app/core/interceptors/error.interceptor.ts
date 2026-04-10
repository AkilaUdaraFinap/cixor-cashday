import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        localStorage.removeItem('ccd_access_token');
        localStorage.removeItem('ccd_refresh_token');
        router.navigate(['/auth/login']);
        notify.error('Session expired. Please log in again.');
      } else if (err.status === 403) {
        notify.error('You do not have permission to perform this action.');
      } else if (err.status === 0 || err.status >= 500) {
        notify.error('A server error occurred. Please try again later.');
      }
      return throwError(() => err);
    }),
  );
};
