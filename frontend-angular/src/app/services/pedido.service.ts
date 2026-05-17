import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private apiUrl = 'http://localhost:3000/api/pedidos';

  constructor(private http: HttpClient) { }

  // Obtener pedidos
  obtenerPedidos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Crear pedido
  crearPedido(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Eliminar pedido
  eliminarPedido(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Actualizar pedido
  actualizarPedido(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}