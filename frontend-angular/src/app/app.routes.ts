import { Routes } from '@angular/router';
import { Login } from './login/login';
import { EmpleadosComponent } from './empleados/empleados';
import { ProductosComponent } from './productos/productos';
import { authGuard } from './auth.guard'; // 🔥 IMPORTANTE

export const routes: Routes = [

  // 🔐 LOGIN
  { path: '', component: Login },

  // 📦 PRODUCTOS (PROTEGIDO)
  {
    path: 'productos',
    component: ProductosComponent,
    canActivate: [authGuard] // 🔥 AQUÍ ACTIVAS SEGURIDAD
  },

  // 👨‍💼 EMPLEADOS (TAMBIÉN PROTEGIDO)
  {
    path: 'empleados',
    component: EmpleadosComponent,
    canActivate: [authGuard] // 🔥 TAMBIÉN AQUÍ
  },

  // 🚫 RUTA NO EXISTENTE
  { path: '**', redirectTo: '' }

];