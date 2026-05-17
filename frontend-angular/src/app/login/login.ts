import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  AuthService
} from '../services/auth.service';

@Component({

  selector: 'app-login',

  standalone: true,

  imports: [
    FormsModule,
    CommonModule
  ],

  templateUrl: './login.html',

  styleUrls: ['./login.css']

})

export class Login implements OnInit {

  usuario: string = '';

  password: string = '';

  mensajeError: string = '';

  tipoMensaje: string = '';

  cargando: boolean = false;

  verPassword: boolean = false;

  constructor(

    private router: Router,

    private authService: AuthService

  ) {}

  // 🔥 AL ENTRAR AL LOGIN

  ngOnInit(): void {

    const mensaje =
      localStorage.getItem(
        'mensaje'
      );

    if (mensaje === 'logout') {

      this.mensajeError =
        'Sesión cerrada correctamente';

      this.tipoMensaje =
        'success';

      setTimeout(() => {

        this.mensajeError = '';

        this.tipoMensaje = '';

      }, 3000);

      localStorage.removeItem(
        'mensaje'
      );

    }

    // 🔐 SI YA ESTÁ LOGUEADO

    else if (
      this.authService
        .estaLogueado()
    ) {

      this.router.navigate([
        '/dashboard'
      ]);

    }

  }

  // 🔐 LOGIN

  login(): void {

    // 🔍 VALIDAR CAMPOS

    if (

      !this.usuario ||

      !this.password

    ) {

      this.mensajeError =
        'Todos los campos son obligatorios';

      this.tipoMensaje =
        'error';

      return;

    }

    // 🔄 RESETEAR MENSAJES

    this.mensajeError = '';

    this.tipoMensaje = '';

    this.cargando = true;

    // 🚀 LOGIN

    this.authService.login({

      email: this.usuario,

      password: this.password

    })

    .subscribe({

      next: (respuesta: any) => {

        // 🔐 GUARDAR TOKEN

        this.authService
          .guardarToken(
            respuesta.token
          );

        // 👤 GUARDAR USUARIO

        this.authService
          .guardarUsuario(
            respuesta.usuario
          );

        // ✅ LOGIN EXITOSO

        this.tipoMensaje =
          'success';

        this.mensajeError =
          'Bienvenido al sistema';

        this.cargando = false;

        // 🚀 REDIRECCIONAR

        setTimeout(() => {

          this.router.navigate([
            '/dashboard'
          ]);

        }, 1000);

      },

      error: (error) => {

        console.error(error);

        this.tipoMensaje =
          'error';

        this.mensajeError =

          error.error.mensaje ||

          'Credenciales incorrectas';

        this.cargando = false;

      }

    });

  }

  // 👁️ MOSTRAR PASSWORD

  togglePassword(): void {

    this.verPassword =
      !this.verPassword;

  }

  // 🔐 RECUPERAR PASSWORD

  recuperar(): void {

    this.mensajeError =
      'Funcionalidad en desarrollo';

    this.tipoMensaje =
      'error';

  }

}