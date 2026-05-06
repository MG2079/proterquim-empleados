import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  constructor(private router: Router) {}

  irAProductos() {
    this.router.navigate(['/productos']);
  }

  irAEmpleados() {
    this.router.navigate(['/empleados']);
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    // 🔥 Limpia toda la sesión
    localStorage.clear();
    sessionStorage.clear();

    // 🔥 Redirige al login (NO al dashboard)
    this.router.navigateByUrl('/login');
  }
}