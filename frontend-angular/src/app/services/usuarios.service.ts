
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SolicitudUsuario {
  _id: string;
  nombre: string;
  email: string;
  rolSolicitado: string;
  createdAt?: string;
}

export interface ResolverSolicitud {
  decision: 'aprobar' | 'rechazar';
  rol?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  obtenerPendientes(): Observable<SolicitudUsuario[]> {
    return this.http.get<SolicitudUsuario[]>(
      `${this.apiUrl}/pendientes`
    );
  }

  resolverSolicitud(
    id: string,
    datos: ResolverSolicitud
  ): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(
      `${this.apiUrl}/${encodeURIComponent(id)}/aprobacion`,
      datos
    );
  }
}
