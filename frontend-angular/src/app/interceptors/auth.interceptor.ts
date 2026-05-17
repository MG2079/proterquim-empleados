import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError
} from 'rxjs/operators';

import {
  throwError
} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (

  req,
  next

) => {

  const router = inject(Router);

  const token = localStorage.getItem('token');

  let request = req;

  // 🔐 AGREGAR TOKEN

  if (token) {

    request = req.clone({

      setHeaders: {

        Authorization: `Bearer ${token}`

      }

    });

  }

  return next(request).pipe(

    catchError((error) => {

      // 🚨 TOKEN INVÁLIDO

      if (error.status === 401) {

        // 🔥 EVITAR LOOP INFINITO

        if (
          router.url !== '/login'
        ) {

          localStorage.clear();

          sessionStorage.clear();

          router.navigateByUrl('/login');

        }

      }

      return throwError(() => error);

    })

  );

};