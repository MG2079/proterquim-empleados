import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

/* 📦 INTERFAZ PRODUCTO */

export interface Producto {

  _id?: string;

  nombre: string;

  descripcion: string;

  precio: number;

  stock: number;

  stockMinimo: number;

  categoria?: string;

  estado?: string;

  createdAt?: Date;

  updatedAt?: Date;

}

@Injectable({

  providedIn: 'root'

})

export class ProductoService {

  // 🌐 API

  private apiUrl =
    'http://localhost:3000/api/productos';

  constructor(

    private http: HttpClient

  ) {}

  // 📦 LISTAR PRODUCTOS

  obtenerProductos():
  Observable<Producto[]> {

    return this.http.get<Producto[]>(

      this.apiUrl

    );

  }

  // 🔍 OBTENER PRODUCTO POR ID

  obtenerProductoPorId(
    id: string
  ): Observable<Producto> {

    return this.http.get<Producto>(

      `${this.apiUrl}/${id}`

    );

  }

  // ➕ CREAR PRODUCTO

  crearProducto(
    producto: Producto
  ): Observable<Producto> {

    // 🔥 VALIDAR STOCK MÍNIMO

    if (!producto.stockMinimo) {

      producto.stockMinimo = 20;

    }

    return this.http.post<Producto>(

      this.apiUrl,

      producto

    );

  }

  // ✏️ ACTUALIZAR PRODUCTO

  actualizarProducto(

    id: string,

    producto: Producto

  ): Observable<Producto> {

    return this.http.put<Producto>(

      `${this.apiUrl}/${id}`,

      producto

    );

  }

  // 🗑 ELIMINAR PRODUCTO

  eliminarProducto(
    id: string
  ): Observable<any> {

    return this.http.delete(

      `${this.apiUrl}/${id}`

    );

  }

  // 📊 CALCULAR ESTADO INVENTARIO

  calcularEstado(

    stock: number,

    minimo: number

  ): string {

    // 🔴 CRÍTICO

    if (stock <= minimo / 2) {

      return 'Crítico';

    }

    // 🟠 BAJO

    if (stock <= minimo) {

      return 'Bajo';

    }

    // 🟢 NORMAL

    return 'Normal';

  }

  // ⚠️ VALIDAR STOCK BAJO

  tieneStockBajo(
    producto: Producto
  ): boolean {

    return (

      producto.stock <=
      producto.stockMinimo

    );

  }

  // 💰 CALCULAR VALOR INVENTARIO

  calcularValorInventario(
    productos: Producto[]
  ): number {

    return productos.reduce(

      (

        total,

        producto

      ) => {

        return total +

          (

            producto.precio *

            producto.stock

          );

      },

      0

    );

  }

}