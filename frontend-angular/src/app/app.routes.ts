import { Routes } from '@angular/router';
import { Login } from './login/login';
import { EmpleadosComponent } from './empleados/empleados';
import { ProductosComponent } from './productos/productos';
export const routes: Routes = [

  // 🔐 LOGIN
  { path: '', component: Login },

  // 📦 PRODUCTOS (PRINCIPAL)
 {
  path: 'productos',
  component: ProductosComponent
},
  // 👨‍💼 EMPLEADOS
  { path: 'empleados', component: EmpleadosComponent },

  // 🚫 RUTA NO EXISTENTE
  { path: '**', redirectTo: '' }

];