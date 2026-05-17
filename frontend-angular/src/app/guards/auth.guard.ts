import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  // 🔐 OBTENER TOKEN
  const token = localStorage.getItem('token');

  // ✅ SI EXISTE TOKEN
  if (token) {
    return true;
  }

  // ❌ SI NO EXISTE → LOGIN
  router.navigate(['/login']);

  return false;
};