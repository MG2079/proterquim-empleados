import {
  CanActivateFn
} from '@angular/router';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

export const roleGuard:
CanActivateFn = (route) => {

  const router =
    inject(Router);

  // 🔐 OBTENER USUARIO

  const usuario =
    localStorage.getItem(
      'usuario'
    );

  // ❌ SI NO EXISTE

  if (!usuario) {

    router.navigate([
      '/login'
    ]);

    return false;

  }

  // 🔥 PARSEAR USUARIO

  const usuarioParseado =
    JSON.parse(usuario);

  // 🔥 OBTENER ROL

  const rolUsuario =
    usuarioParseado.rol;

  // 🔥 ROLES PERMITIDOS

  const rolesPermitidos =
    route.data?.['roles'];

  // 🔒 VALIDAR ROL

  if (

    rolesPermitidos &&

    !rolesPermitidos.includes(
      rolUsuario
    )

  ) {

    router.navigate([
      '/dashboard'
    ]);

    return false;

  }

  // ✅ PERMITIR

  return true;

};