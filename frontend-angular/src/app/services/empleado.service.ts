import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Interfaz
export interface Empleado {
  _id?: string;
  nombre: string;
  cargo: string;
  salario: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  private apiUrl = 'http://localhost:3000/api/empleados';

  constructor(private http: HttpClient) {}

  // 🔍 Obtener todos
  obtenerEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  // ➕ Crear
  crearEmpleado(empleado: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.apiUrl, empleado);
  }

  // ✏️ Actualizar
  actualizarEmpleado(id: string, empleado: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, empleado);
  }

  // ❌ Eliminar
  eliminarEmpleado(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}