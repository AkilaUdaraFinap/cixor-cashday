import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectAuthUser } from '../../../store/auth/auth.selectors';
import { UserRole } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const allowedRoles: UserRole[] = route.data['roles'] ?? [];

  return store.select(selectAuthUser).pipe(
    take(1),
    map(user => {
      if (!user) return router.createUrlTree(['/auth/login']);
      if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) return true;
      return router.createUrlTree(['/forbidden']);
    }),
  );
};
