
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UsuariosService,
  SolicitudUsuario
} from '../services/usuarios.service';

@Component({
  selector: 'app-usuarios-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-pendientes.html',
  styleUrls: ['./usuarios-pendientes.css']
})
export class UsuariosPendientesComponent implements OnInit {
  solicitudes: SolicitudUsuario[] = [];

  roles = [
    'Gerente',
    'Administrador',
    'Contador',
    'Empleado'
  ];

  cargando = false;
  procesandoId: string | null = null;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  constructor(
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando = true;
    this.mensaje = '';

    this.usuariosService.obtenerPendientes().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes.map(
          (solicitud) => ({ ...solicitud })
        );

        this.cargando = false;
      },
      error: (error) => {
        console.error(
          'Error consultando solicitudes:',
          error
        );

        this.mensaje =
          error?.error?.mensaje ||
          'No se pudieron cargar las solicitudes.';

        this.tipoMensaje = 'error';
        this.cargando = false;
      }
    });
  }

  resolver(
    solicitud: SolicitudUsuario,
    decision: 'aprobar' | 'rechazar',
    rol?: string
  ): void {
    if (
      decision === 'aprobar' &&
      (!rol || !this.roles.includes(rol))
    ) {
      this.mensaje = 'Selecciona un rol válido.';
      this.tipoMensaje = 'error';
      return;
    }

    const confirmacion =
      decision === 'aprobar'
        ? `¿Aprobar la cuenta de ${solicitud.nombre} con el rol ${rol}?`
        : `¿Rechazar la solicitud de ${solicitud.nombre}?`;

    if (!confirm(confirmacion)) {
      return;
    }

    this.procesandoId = solicitud._id;
    this.mensaje = '';

    this.usuariosService.resolverSolicitud(
      solicitud._id,
      {
        decision,
        ...(decision === 'aprobar' ? { rol } : {})
      }
    ).subscribe({
      next: (respuesta) => {
        this.mensaje = respuesta.mensaje;
        this.tipoMensaje = 'success';
        this.procesandoId = null;
        this.cargarSolicitudes();
      },
      error: (error) => {
        console.error(
          'Error procesando solicitud:',
          error
        );

        this.mensaje =
          error?.error?.mensaje ||
          'No se pudo procesar la solicitud.';

        this.tipoMensaje = 'error';
        this.procesandoId = null;
      }
    });
  }
}
