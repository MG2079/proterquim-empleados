import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  _id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  // 🔥 URL CORRECTA (AQUÍ ESTABA EL ERROR)
  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(private http: HttpClient) {}

  // 🔍 LISTAR PRODUCTOS
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  // ➕ CREAR PRODUCTO
  crearProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  // 🗑 ELIMINAR PRODUCTO
  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✏️ ACTUALIZAR PRODUCTO (opcional pero recomendado)
  actualizarProducto(id: string, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }
}