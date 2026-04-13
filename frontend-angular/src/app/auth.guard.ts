import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  const isLogged = localStorage.getItem('auth');

  if (isLogged === 'true') {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};