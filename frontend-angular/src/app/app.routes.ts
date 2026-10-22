
import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { ProductosComponent } from './productos/productos';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { InventariosComponent } from './inventarios/inventarios';
import { EmpleadosComponent } from './empleados/empleados';
import { ReportesComponent } from './reportes/reportes';

import { Login } from './login/login';
import { ResetPassword } from './reset-password';
import { UsuariosPendientesComponent } from './usuarios/usuarios-pendientes';

export const routes: Routes = [
  // LOGIN
  {
    path: 'login',
    component: Login
  },

  // RESTABLECIMIENTO DE CONTRASEÑA
  // Ruta pública, sin autenticación.
  {
    path: 'reset-password',
    component: ResetPassword
  },

  // SISTEMA PRINCIPAL
  {
    path: '',
    component: LayoutComponent,
    children: [
      // DASHBOARD
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
      },

      // PRODUCTOS
      {
        path: 'productos',
        component: ProductosComponent,
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['Administrador', 'Gerente']
        }
      },

      // PEDIDOS
      {
        path: 'pedidos',
        component: PedidosComponent,
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['Administrador', 'Gerente', 'Contador']
        }
      },

      // INVENTARIOS
      {
        path: 'inventarios',
        component: InventariosComponent,
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['Administrador', 'Gerente', 'Empleado']
        }
      },

      // EMPLEADOS
      {
        path: 'empleados',
        component: EmpleadosComponent,
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['Administrador']
        }
      },

      // REPORTES
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['Administrador', 'Contador']
        }
      },

      // SOLICITUDES DE USUARIOS
      {
        path: 'usuarios-pendientes',
        component: UsuariosPendientesComponent,
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['Desarrollador', 'Administrador', 'Gerente']
        }
      },

      // REDIRECCIÓN INTERNA
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // RUTA NO ENCONTRADA
  {
    path: '**',
    redirectTo: 'login'
  }
];