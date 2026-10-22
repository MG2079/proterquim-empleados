
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(datos: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      datos
    );
  }

  register(datos: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/register`,
      datos
    );
  }

  solicitarRecuperacion(email: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/solicitar-recuperacion`,
      { email }
    );
  }

  restablecerPassword(
    token: string,
    password: string
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/restablecer-password`,
      { token, password }
    );
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  guardarUsuario(usuario: any): void {
    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario)
    );
  }

  obtenerUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  obtenerRol(): string | null {
    const usuario = this.obtenerUsuario();
    return usuario?.rol || null;
  }

  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
}
