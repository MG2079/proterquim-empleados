import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ProductosComponent } from './productos/productos';
import { EmpleadosComponent } from './empleados/empleados';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Login } from './login/login'; // 👈 IMPORTANTE

export const routes: Routes = [

  // 🔐 LOGIN (FUERA DEL LAYOUT)
  {
    path: 'login',
    component: Login
  },

  // 🔥 APP CON LAYOUT
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'empleados', component: EmpleadosComponent },

      // 🔥 REDIRECCIÓN INTERNA
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 🚫 CUALQUIER RUTA DESCONOCIDA
  { path: '**', redirectTo: 'login' }

];