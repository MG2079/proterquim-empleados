import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  ProductoService
} from '../services/producto.service';

import {
  EmpleadoService
} from '../services/empleado.service';

import {
  PedidoService
} from '../services/pedido.service';

@Component({

  selector: 'app-dashboard',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './dashboard.component.html',

  styleUrl:
    './dashboard.component.css'

})

export class DashboardComponent
implements OnInit {

  // 📦 PRODUCTOS STOCK BAJO

  productos: any[] = [];

  // 🧾 PEDIDOS RECIENTES

  pedidosRecientes: any[] = [];

  // 📊 MÉTRICAS

  totalProductos = 0;

  totalEmpleados = 0;

  totalPedidos = 0;

  stockBajo = 0;

  ventasTotales = 0;

  // 🔄 LOADING

  cargando = false;

  constructor(

    private router: Router,

    private productoService:
    ProductoService,

    private empleadoService:
    EmpleadoService,

    private pedidoService:
    PedidoService

  ) {}

  ngOnInit(): void {

    this.cargarDashboard();

  }

  // 📊 CARGAR DASHBOARD

  cargarDashboard(): void {

    this.cargando = true;

    this.cargarProductos();

    this.cargarEmpleados();

    this.cargarPedidos();

  }

  // 📦 PRODUCTOS

  cargarProductos(): void {

    this.productoService
      .obtenerProductos()

      .subscribe({

        next: (productos: any[]) => {

          // 📦 TOTAL PRODUCTOS

          this.totalProductos =
            productos.length;

          // ⚠️ STOCK BAJO

          this.productos =
            productos.filter(

              producto =>

                producto.stock <= 5

            );

          this.stockBajo =
            this.productos.length;

        },

        error: (error) => {

          console.error(

            'Error cargando productos:',

            error

          );

        }

      });

  }

  // 👨‍💼 EMPLEADOS

  cargarEmpleados(): void {

    this.empleadoService
      .obtenerEmpleados()

      .subscribe({

        next: (empleados: any[]) => {

          this.totalEmpleados =
            empleados.length;

        },

        error: (error) => {

          console.error(

            'Error cargando empleados:',

            error

          );

        }

      });

  }

  // 🧾 PEDIDOS

  cargarPedidos(): void {

    this.pedidoService
      .obtenerPedidos()

      .subscribe({

        next: (pedidos: any[]) => {

          // 📦 TOTAL PEDIDOS

          this.totalPedidos =
            pedidos.length;

          // 💰 VENTAS TOTALES

          this.ventasTotales =
            pedidos.reduce(

              (
                total: number,

                pedido: any

              ) => {

                return total +

                  Number(
                    pedido.total
                  );

              },

              0

            );

          // 🧾 PEDIDOS RECIENTES

          this.pedidosRecientes =
            pedidos.slice(0, 5);

          this.cargando = false;

        },

        error: (error) => {

          console.error(

            'Error cargando pedidos:',

            error

          );

          this.cargando = false;

        }

      });

  }

  // 🚀 IR A PRODUCTOS

  irAProductos(): void {

    this.router.navigate([
      '/productos'
    ]);

  }

  // 🚀 IR A EMPLEADOS

  irAEmpleados(): void {

    this.router.navigate([
      '/empleados'
    ]);

  }

  // 🚀 IR A PEDIDOS

  irAPedidos(): void {

    this.router.navigate([
      '/pedidos'
    ]);

  }

}