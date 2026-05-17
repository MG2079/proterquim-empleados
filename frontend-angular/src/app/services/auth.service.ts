import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

@Injectable({

  providedIn: 'root'

})

export class AuthService {

  // 🌐 API

  private apiUrl =
    'http://localhost:3000/api/auth';

  constructor(

    private http: HttpClient

  ) {}

  // 🔐 LOGIN

  login(
    datos: any
  ): Observable<any> {

    return this.http.post<any>(

      `${this.apiUrl}/login`,

      datos

    );

  }

  // 📝 REGISTER

  register(
    datos: any
  ): Observable<any> {

    return this.http.post<any>(

      `${this.apiUrl}/register`,

      datos

    );

  }

  // 🔐 GUARDAR TOKEN

  guardarToken(
    token: string
  ): void {

    localStorage.setItem(
      'token',
      token
    );

  }

  // 🔍 OBTENER TOKEN

  obtenerToken():
  string | null {

    return localStorage.getItem(
      'token'
    );

  }

  // 👤 GUARDAR USUARIO

  guardarUsuario(
    usuario: any
  ): void {

    localStorage.setItem(

      'usuario',

      JSON.stringify(usuario)

    );

  }

  // 👤 OBTENER USUARIO

  obtenerUsuario(): any {

    const usuario =
      localStorage.getItem(
        'usuario'
      );

    return usuario

      ? JSON.parse(usuario)

      : null;

  }

  // 🔐 OBTENER ROL

  obtenerRol():
  string | null {

    const usuario =
      this.obtenerUsuario();

    return usuario?.rol || null;

  }

  // ✅ VALIDAR LOGIN

  estaLogueado():
  boolean {

    return !!this.obtenerToken();

  }

  // 🔓 LOGOUT

  logout(): void {

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'usuario'
    );

  }

}