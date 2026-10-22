
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  usuario: string = '';
  password: string = '';

  nombreRegistro: string = '';
  emailRegistro: string = '';
  passwordRegistro: string = '';
  rolSolicitado: string = 'Empleado';

  modoRegistro: boolean = false;
  mensajeError: string = '';
  tipoMensaje: string = '';
  cargando: boolean = false;
  verPassword: boolean = false;
  verPasswordRegistro: boolean = false;

  readonly rolesSolicitables = [
    'Empleado',
    'Contador',
    'Gerente',
    'Administrador'
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const mensaje = localStorage.getItem('mensaje');

    if (mensaje === 'logout') {
      this.mensajeError = 'Sesión cerrada correctamente';
      this.tipoMensaje = 'success';

      setTimeout(() => {
        this.mensajeError = '';
        this.tipoMensaje = '';
      }, 3000);

      localStorage.removeItem('mensaje');
    } else if (this.authService.estaLogueado()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // ==========================================
  // INICIO DE SESIÓN
  // ==========================================

  login(): void {
    if (!this.usuario.trim() || !this.password) {
      this.mostrarMensaje(
        'Todos los campos son obligatorios',
        'error'
      );
      return;
    }

    this.mensajeError = '';
    this.tipoMensaje = '';
    this.cargando = true;

    this.authService.login({
      email: this.usuario.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: (respuesta: any) => {
        this.authService.guardarToken(respuesta.token);
        this.authService.guardarUsuario(respuesta.usuario);

        this.mostrarMensaje(
          'Bienvenido al sistema',
          'success'
        );

        this.cargando = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error: any) => {
        console.error('Error en login:', error);

        this.mostrarMensaje(
          error?.error?.mensaje ||
            'No fue posible iniciar sesión',
          'error'
        );

        this.cargando = false;
      }
    });
  }

  // ==========================================
  // REGISTRO DE USUARIOS
  // ==========================================

  registrar(): void {
    if (
      !this.nombreRegistro.trim() ||
      !this.emailRegistro.trim() ||
      !this.passwordRegistro
    ) {
      this.mostrarMensaje(
        'Completa todos los campos del registro',
        'error'
      );
      return;
    }

    if (this.passwordRegistro.length < 8) {
      this.mostrarMensaje(
        'La contraseña debe tener al menos 8 caracteres',
        'error'
      );
      return;
    }

    if (
      !this.rolesSolicitables.includes(
        this.rolSolicitado
      )
    ) {
      this.mostrarMensaje(
        'El rol solicitado no es válido',
        'error'
      );
      return;
    }

    this.mensajeError = '';
    this.tipoMensaje = '';
    this.cargando = true;

    this.authService.register({
      nombre: this.nombreRegistro.trim(),
      email: this.emailRegistro.trim().toLowerCase(),
      password: this.passwordRegistro,
      rolSolicitado: this.rolSolicitado
    }).subscribe({
      next: (respuesta: any) => {
        this.mostrarMensaje(
          respuesta?.mensaje ||
            'Solicitud enviada. Espera la aprobación de tu cuenta.',
          'success'
        );

        this.cargando = false;
        this.nombreRegistro = '';
        this.emailRegistro = '';
        this.passwordRegistro = '';
        this.rolSolicitado = 'Empleado';
      },
      error: (error: any) => {
        console.error('Error en registro:', error);

        this.mostrarMensaje(
          error?.error?.mensaje ||
            'No se pudo enviar la solicitud',
          'error'
        );

        this.cargando = false;
      }
    });
  }

  // ==========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==========================================

  recuperar(): void {
    const email = this.usuario.trim().toLowerCase();

    if (!email) {
      this.mostrarMensaje(
        'Ingresa tu correo electrónico en el campo de usuario para recuperar tu contraseña.',
        'error'
      );
      return;
    }

    this.mensajeError = '';
    this.tipoMensaje = '';
    this.cargando = true;

    this.authService.solicitarRecuperacion(email).subscribe({
      next: (respuesta: any) => {
        this.mostrarMensaje(
          respuesta?.mensaje ||
            'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.',
          'success'
        );

        this.cargando = false;
      },
      error: (error: any) => {
        console.error(
          'Error al solicitar recuperación:',
          error
        );

        this.mostrarMensaje(
          error?.error?.mensaje ||
            'No fue posible procesar la solicitud. Inténtalo nuevamente.',
          'error'
        );

        this.cargando = false;
      }
    });
  }

  // ==========================================
  // CONTROLES DE INTERFAZ
  // ==========================================

  cambiarModoRegistro(): void {
    this.modoRegistro = !this.modoRegistro;
    this.mensajeError = '';
    this.tipoMensaje = '';
  }

  togglePassword(): void {
    this.verPassword = !this.verPassword;
  }

  togglePasswordRegistro(): void {
    this.verPasswordRegistro =
      !this.verPasswordRegistro;
  }

  // ==========================================
  // MENSAJES
  // ==========================================

  private mostrarMensaje(
    mensaje: string,
    tipo: string
  ): void {
    this.mensajeError = mensaje;
    this.tipoMensaje = tipo;
  }
}
