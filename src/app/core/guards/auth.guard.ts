import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectAuthUser } from '../../../store/auth/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthUser).pipe(
    take(1),
    map(user => {
      if (user) return true;
      // Also check localStorage token for page refresh scenarios
      const token = localStorage.getItem('ccd_access_token');
      if (token) return true;
      return router.createUrlTree(['/auth/login']);
    }),
  );
};
