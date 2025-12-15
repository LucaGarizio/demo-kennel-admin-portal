import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PocketbaseService } from './shared/service/pocket-base-services/pocketbase.service';

export const AuthGuard: CanActivateFn = () => {
  const pb = inject(PocketbaseService);
  const router = inject(Router);

  if (pb.pb.authStore.isValid && pb.pb.authStore.token) return true;

  router.navigate(['/']);
  return false;
};
