import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

// 📦 INTERFAZ INVENTARIO

export interface Inventario {

  _id?: string;

  producto: string;

  categoria: string;

  stock: number;

  minimo: number;

  ubicacion: string;

  estado: string;

}

@Injectable({

  providedIn: 'root'

})

export class InventarioService {

  // 🌐 API

  private apiUrl =
    'http://localhost:3000/api/inventarios';

  constructor(

    private http: HttpClient

  ) {}

  // 📦 OBTENER INVENTARIOS

  obtenerInventarios():
  Observable<Inventario[]> {

    return this.http.get<Inventario[]>(

      this.apiUrl

    );

  }

  // ➕ CREAR INVENTARIO

  crearInventario(
    inventario: Inventario
  ): Observable<Inventario> {

    return this.http.post<Inventario>(

      this.apiUrl,

      inventario

    );

  }

  // ✏️ ACTUALIZAR INVENTARIO

  actualizarInventario(

    id: string,

    inventario: Inventario

  ): Observable<Inventario> {

    return this.http.put<Inventario>(

      `${this.apiUrl}/${id}`,

      inventario

    );

  }

  // 🗑 ELIMINAR INVENTARIO

  eliminarInventario(
    id: string
  ): Observable<any> {

    return this.http.delete(

      `${this.apiUrl}/${id}`

    );

  }

}