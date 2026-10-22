
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  // Menú móvil
  menuAbierto = false;

  // Usuario actual
  usuario: any = null;
  rol: string = '';

  constructor(
    private router: Router,
    private searchService: SearchService
  ) {
    this.cargarUsuario();
  }

  // Obtener usuario de la sesión
  private cargarUsuario(): void {
    const usuarioStorage = localStorage.getItem('usuario');

    if (usuarioStorage) {
      try {
        this.usuario = JSON.parse(usuarioStorage);
        this.rol = this.usuario?.rol || '';
      } catch (error) {
        console.error('Error al leer el usuario almacenado:', error);
        this.usuario = null;
        this.rol = '';
      }
    }
  }

  // Buscador global
  buscar(event: Event): void {
    const elemento = event.target as HTMLInputElement;
    this.searchService.setTermino(elemento.value);
  }

  // Navegación
  irAProductos(): void {
    this.router.navigate(['/productos']);
  }

  irAEmpleados(): void {
    this.router.navigate(['/empleados']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // Validación de roles
  esDesarrollador(): boolean {
    return this.rol === 'Desarrollador';
  }

  esAdmin(): boolean {
    return this.rol === 'Administrador';
  }

  esGerente(): boolean {
    return this.rol === 'Gerente';
  }

  esContador(): boolean {
    return this.rol === 'Contador';
  }

  esEmpleado(): boolean {
    return this.rol === 'Empleado';
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    localStorage.setItem('mensaje', 'logout');

    this.usuario = null;
    this.rol = '';

    this.router.navigate(['/login']);
  }
}
