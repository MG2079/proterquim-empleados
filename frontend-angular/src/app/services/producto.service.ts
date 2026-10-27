import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ==========================================
   INTERFAZ PRODUCTO
========================================== */

export type EstadoProducto = 'Normal' | 'Bajo' | 'Crítico';

export interface Producto {
  _id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  categoria?: string;
  estado?: EstadoProducto;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ==========================================
   RESPUESTA DEL BACKEND
========================================== */

export interface RespuestaProducto {
  mensaje: string;
  producto: Producto;
}

/* ==========================================
   SERVICIO DE PRODUCTOS
========================================== */

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(private http: HttpClient) {}

  // LISTAR PRODUCTOS
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  // OBTENER PRODUCTO POR ID
  obtenerProductoPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // CREAR PRODUCTO
  crearProducto(producto: Producto): Observable<RespuestaProducto> {
    const datos = {
      ...producto,
      categoria: producto.categoria?.trim() || 'General',
      stockMinimo: producto.stockMinimo ?? 20
    };

    return this.http.post<RespuestaProducto>(
      this.apiUrl,
      datos
    );
  }

  // ACTUALIZAR PRODUCTO
  actualizarProducto(
    id: string,
    producto: Producto
  ): Observable<RespuestaProducto> {
    return this.http.put<RespuestaProducto>(
      `${this.apiUrl}/${id}`,
      producto
    );
  }

  // ELIMINAR PRODUCTO
  eliminarProducto(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}/${id}`
    );
  }

  // CALCULAR ESTADO SEGÚN LA REGLA ACORDADA
  calcularEstado(stock: number, _minimo = 20): EstadoProducto {
    if (stock < 20) {
      return 'Crítico';
    }

    if (stock <= 30) {
      return 'Bajo';
    }

    return 'Normal';
  }

  // INDICAR SI EL PRODUCTO REQUIERE ATENCIÓN
  tieneStockBajo(producto: Producto): boolean {
    return producto.stock <= 30;
  }

  // CALCULAR VALOR TOTAL DEL INVENTARIO
  calcularValorInventario(productos: Producto[]): number {
    return productos.reduce(
      (total, producto) => total + producto.precio * producto.stock,
      0
    );
  }
}
