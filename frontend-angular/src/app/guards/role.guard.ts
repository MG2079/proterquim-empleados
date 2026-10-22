
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('usuario');

  if (!token || !usuarioGuardado) {
    return router.createUrlTree(['/login']);
  }

  try {
    const usuario = JSON.parse(usuarioGuardado);
    const rolUsuario = usuario?.rol;
    const rolesPermitidos: string[] | undefined =
      route.data?.['roles'];

    if (
      !rolUsuario ||
      (rolesPermitidos && !rolesPermitidos.includes(rolUsuario))
    ) {
      return router.createUrlTree(['/dashboard']);
    }

    return true;
  } catch (error) {
    console.error('No se pudo leer el usuario almacenado:', error);

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    return router.createUrlTree(['/login']);
  }
};
