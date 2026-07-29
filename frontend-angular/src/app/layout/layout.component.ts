import { Component } from '@angular/core';

import {
  Router,
  RouterModule
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  SearchService
} from '../services/search.service';

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

  // 🍔 MENU MOBILE

  menuAbierto = false;

  // 🔐 USUARIO ACTUAL

  usuario: any = null;

  rol: string = '';

  constructor(

    private router: Router,

    private searchService: SearchService

  ) {

    // 🔥 OBTENER USUARIO

    const usuarioStorage =
      localStorage.getItem(
        'usuario'
      );

    if (usuarioStorage) {

      this.usuario =
        JSON.parse(
          usuarioStorage
        );

      this.rol =
        this.usuario.rol;

    }

  }

  // 🔍 BUSCADOR GLOBAL

  buscar(event: any) {

    const valor =
      event.target.value;

    this.searchService
      .setTermino(valor);

  }

  // 🚀 NAVEGACIÓN

  irAProductos() {

    this.router.navigate([
      '/productos'
    ]);

  }

  irAEmpleados() {

    this.router.navigate([
      '/empleados'
    ]);

  }

  irADashboard() {

    this.router.navigate([
      '/dashboard'
    ]);

  }

  // 🔥 VALIDAR ROLES

  esAdmin(): boolean {

    return this.rol ===
      'Administrador';

  }

  esGerente(): boolean {

    return this.rol ===
      'Gerente';

  }

  esContador(): boolean {

    return this.rol ===
      'Contador';

  }

  esEmpleado(): boolean {

    return this.rol ===
      'Empleado';

  }

  // 🔐 CERRAR SESIÓN

  logout() {

    // 🗑️ LIMPIAR STORAGE

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'usuario'
    );

    // 📝 MENSAJE LOGIN

    localStorage.setItem(

      'mensaje',

      'logout'

    );

    // 🚀 LOGIN

    this.router.navigate([
      '/login'
    ]);

  }

}