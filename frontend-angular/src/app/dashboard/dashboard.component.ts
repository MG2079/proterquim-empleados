import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../services/producto.service';
import { EmpleadoService } from '../services/empleado.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  productos: any[] = [];

  totalProductos = 0;
  totalEmpleados = 0;
  stockBajo = 0;

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.productoService.obtenerProductos().subscribe(data => {
      this.productos = data;
      this.totalProductos = data.length;
      this.stockBajo = data.filter(p => p.stock < 5).length;
    });

    this.empleadoService.obtenerEmpleados().subscribe(data => {
      this.totalEmpleados = data.length;
    });
  }

  irAProductos() {
    this.router.navigate(['/productos']);
  }

  irAEmpleados() {
    this.router.navigate(['/empleados']);
  }

  logout() {
    localStorage.removeItem('auth');
    this.router.navigate(['/']);
  }

}
