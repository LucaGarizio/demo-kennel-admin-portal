import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PocketbaseService } from './shared/service/pocket-base-services/pocketbase.service';

/**
 * AuthGuard: blocca l’accesso alle rotte se l’utente non è autenticato.
 * Controlla lo stato `pb.isAuth` del servizio PocketbaseService.
 */
export const AuthGuard: CanActivateFn = () => {
  const pb = inject(PocketbaseService);
  const router = inject(Router);

  console.log('AuthGuard chiamato', pb.pb.authStore.isValid, pb.pb.authStore.token);

  if (pb.pb.authStore.isValid && pb.pb.authStore.token) return true;

  router.navigate(['/']);
  return false;
};
