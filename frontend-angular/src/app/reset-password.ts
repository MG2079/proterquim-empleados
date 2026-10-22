
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, timeout } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  token = '';
  password = '';
  confirmarPassword = '';

  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'error';
  cargando = false;
  completado = false;
  verPassword = false;
  verConfirmacion = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token =
      this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.mostrarError(
        'El enlace no contiene un token válido. Solicita una nueva recuperación.'
      );
    }
  }

  restablecer(): void {
    if (this.cargando || this.completado) {
      return;
    }

    this.mensaje = '';

    if (!this.token) {
      this.mostrarError(
        'El enlace de recuperación no es válido. Solicita uno nuevo.'
      );
      return;
    }

    if (this.password.length < 8) {
      this.mostrarError(
        'La contraseña debe tener al menos 8 caracteres.'
      );
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.mostrarError(
        'Las contraseñas no coinciden.'
      );
      return;
    }

    this.cargando = true;

    this.authService
      .restablecerPassword(this.token, this.password)
      .pipe(timeout(15000))
      .subscribe({
        next: (respuesta: any) => {
          this.tipoMensaje = 'success';
          this.mensaje =
            respuesta?.mensaje ||
            'Contraseña restablecida correctamente. Ya puedes iniciar sesión.';

          this.completado = true;
          this.password = '';
          this.confirmarPassword = '';
          this.cargando = false;
        },
        error: (error: unknown) => {
          console.error(
            'Error al restablecer contraseña:',
            error
          );

          if (error instanceof TimeoutError) {
            this.mostrarError(
              'El servidor tardó demasiado en responder. Comprueba el backend e inténtalo de nuevo.'
            );
          } else if (error instanceof HttpErrorResponse) {
            this.mostrarError(
              error.error?.mensaje ||
              `Error del servidor (${error.status}). No se pudo restablecer la contraseña.`
            );
          } else {
            this.mostrarError(
              'Ocurrió un error inesperado al restablecer la contraseña.'
            );
          }

          this.cargando = false;
        }
      });
  }

  irAlLogin(): void {
    this.router.navigate(['/login']);
  }

  private mostrarError(mensaje: string): void {
    this.tipoMensaje = 'error';
    this.mensaje = mensaje;
  }
}
