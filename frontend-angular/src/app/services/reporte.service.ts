import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';


@Injectable({

  providedIn: 'root'

})

export class ReporteService {

  private apiUrl =
    'http://localhost:3000/api/reportes';

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // 🔥 DASHBOARD
  // ==========================================

  obtenerDashboard(): Observable<any> {

    return this.http.get(

      `${this.apiUrl}/dashboard`

    );

  }

  // ==========================================
  // 🔥 VENTAS
  // ==========================================

  obtenerVentas(): Observable<any> {

    return this.http.get(

      `${this.apiUrl}/ventas`

    );

  }

  // ==========================================
  // 🔥 PRODUCTOS MÁS VENDIDOS
  // ==========================================

  obtenerProductosMasVendidos():
    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/productos-mas-vendidos`

    );

  }

  // ==========================================
  // 🔥 INVENTARIO CRÍTICO
  // ==========================================

  obtenerInventarioCritico():
    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/inventario-critico`

    );

  }

}