
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { ProductoService } from '../services/producto.service';
import { EmpleadoService } from '../services/empleado.service';
import { PedidoService } from '../services/pedido.service';
import { ReporteService } from '../services/reporte.service';

interface PedidoDashboard {
  cliente?: string;
  total?: number;
  estado?: string;
  fecha?: string | Date;
  createdAt?: string | Date;
}

interface ProductoDashboard {
  nombre?: string;
  precio?: number;
  stock?: number;
  activo?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  productos: ProductoDashboard[] = [];
  pedidosRecientes: PedidoDashboard[] = [];

  totalProductos = 0;
  totalEmpleados = 0;
  totalPedidos = 0;
  stockBajo = 0;
  ventasTotales = 0;
  pedidosPendientes = 0;

  // Datos para las gráficas
  ventasMensuales: { mes: string; total: number }[] = [];
  pedidosPorEstado: { estado: string; cantidad: number }[] = [];

  // Estados reconocidos por el sistema
  readonly estadosPedido = [
    'Pendiente',
    'Procesado',
    'Entregado',
    'Cancelado'
  ];

  // Solo estos estados cuentan como ventas realizadas
  readonly estadosVenta = ['Procesado', 'Entregado'];

  cargando = false;

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private empleadoService: EmpleadoService,
    private pedidoService: PedidoService,
    private reporteService: ReporteService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  // ==========================================
  // CARGA GENERAL DEL DASHBOARD
  // ==========================================

  cargarDashboard(): void {
    this.cargando = true;

    forkJoin({
      productos: this.productoService.obtenerProductos().pipe(
        catchError(error => {
          console.error('Error cargando productos:', error);
          return of(null);
        })
      ),

      empleados: this.empleadoService.obtenerEmpleados().pipe(
        catchError(error => {
          console.error('Error cargando empleados:', error);
          return of(null);
        })
      ),

      pedidos: this.pedidoService.obtenerPedidos().pipe(
        catchError(error => {
          console.error('Error cargando pedidos:', error);
          return of(null);
        })
      ),

      ventas: this.reporteService.obtenerVentas().pipe(
        catchError(error => {
          console.error('Error cargando datos para gráficas:', error);
          return of(null);
        })
      )
    })
    .pipe(
      finalize(() => {
        this.cargando = false;
      })
    )
    .subscribe({
      next: datos => {
        if (Array.isArray(datos.productos)) {
          this.procesarProductos(datos.productos);
        }

        if (Array.isArray(datos.empleados)) {
          this.totalEmpleados = datos.empleados.length;
        }

        if (Array.isArray(datos.pedidos)) {
          this.procesarPedidos(datos.pedidos);
        }

        if (Array.isArray(datos.ventas)) {
          this.procesarGraficas(datos.ventas);
        }
      },

      error: error => {
        console.error(
          'Error inesperado cargando el Dashboard:',
          error
        );
      }
    });
  }

  // ==========================================
  // PRODUCTOS E INVENTARIO
  // ==========================================

  private procesarProductos(productos: ProductoDashboard[]): void {
    // Excluir productos desactivados
    const productosActivos = productos.filter(
      producto => producto.activo !== false
    );

    this.totalProductos = productosActivos.length;

    // Clasificación acordada:
    // Crítico: stock inferior a 20
    // Bajo: stock entre 20 y 30, inclusive
    // Normal: stock superior a 30
    this.productos = productosActivos
      .filter(producto => {
        const stock = Number(producto.stock);

        return Number.isFinite(stock) && stock <= 30;
      })
      .sort((a, b) => Number(a.stock) - Number(b.stock));

    this.stockBajo = this.productos.length;
  }

  // ==========================================
  // PEDIDOS Y VENTAS TOTALES
  // ==========================================

  private procesarPedidos(pedidos: PedidoDashboard[]): void {
    // Todos los estados cuentan como pedidos registrados
    this.totalPedidos = pedidos.length;

    // Solo Procesado y Entregado cuentan como ventas realizadas
    const pedidosRealizados = pedidos.filter(
      pedido => this.esVentaRealizada(pedido)
    );

    this.ventasTotales = this.sumarTotales(pedidosRealizados);

    // Contar pedidos pendientes
    this.pedidosPendientes = pedidos.filter(
      pedido => pedido.estado === 'Pendiente'
    ).length;

    // Ordenar cronológicamente y mostrar los cinco más recientes
    this.pedidosRecientes = [...pedidos]
      .sort((a, b) => {
        return this.obtenerTiempoPedido(b) -
               this.obtenerTiempoPedido(a);
      })
      .slice(0, 5);
  }

  // ==========================================
  // GRÁFICAS: VENTAS MENSUALES Y ESTADOS
  // ==========================================

  private procesarGraficas(pedidos: PedidoDashboard[]): void {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const totalesPorMes = new Map<string, number>();
    const conteoPorEstado = new Map<string, number>();

    // Inicializar todos los estados para que aparezcan incluso en cero
    this.estadosPedido.forEach(estado => {
      conteoPorEstado.set(estado, 0);
    });

    pedidos.forEach(pedido => {
      // Contabilizar todos los pedidos en la gráfica por estado
      if (pedido.estado && conteoPorEstado.has(pedido.estado)) {
        conteoPorEstado.set(
          pedido.estado,
          (conteoPorEstado.get(pedido.estado) || 0) + 1
        );
      }

      // Las ventas mensuales solo incluyen ventas realizadas
      if (!this.esVentaRealizada(pedido)) {
        return;
      }

      const fechaPedido = this.obtenerFechaPedido(pedido);

      if (!fechaPedido) {
        return;
      }

      const fecha = new Date(fechaPedido);

      if (Number.isNaN(fecha.getTime())) {
        return;
      }

      const clave = [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, '0')
      ].join('-');

      totalesPorMes.set(
        clave,
        (totalesPorMes.get(clave) || 0) +
          (Number(pedido.total) || 0)
      );
    });

    // Ordenar por fecha y mostrar los últimos seis meses con ventas
    this.ventasMensuales = Array.from(totalesPorMes.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([clave, total]) => {
        const [anio, mes] = clave.split('-');
        const indiceMes = Number(mes) - 1;

        return {
          mes: `${meses[indiceMes]} ${anio}`,
          total
        };
      });

    this.pedidosPorEstado = this.estadosPedido.map(estado => ({
      estado,
      cantidad: conteoPorEstado.get(estado) || 0
    }));
  }

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

  private esVentaRealizada(pedido: PedidoDashboard): boolean {
    return this.estadosVenta.includes(pedido.estado || '');
  }

  private sumarTotales(pedidos: PedidoDashboard[]): number {
    return pedidos.reduce(
      (acumulado, pedido) => {
        const total = Number(pedido.total);

        return acumulado +
          (Number.isFinite(total) ? total : 0);
      },
      0
    );
  }

  private obtenerFechaPedido(
    pedido: PedidoDashboard
  ): string | Date | undefined {
    return pedido.createdAt || pedido.fecha;
  }

  private obtenerTiempoPedido(pedido: PedidoDashboard): number {
    const fecha = this.obtenerFechaPedido(pedido);

    if (!fecha) {
      return 0;
    }

    const tiempo = new Date(fecha).getTime();

    return Number.isFinite(tiempo) ? tiempo : 0;
  }

  // ==========================================
  // CÁLCULOS PARA LAS GRÁFICAS
  // ==========================================

  obtenerAnchoBarra(total: number): number {
    const maximo = Math.max(
      ...this.ventasMensuales.map(item => item.total),
      1
    );

    return total > 0
      ? Math.max((total / maximo) * 100, 3)
      : 0;
  }

  obtenerPorcentajeEstado(cantidad: number): number {
    return this.totalPedidos > 0
      ? (cantidad / this.totalPedidos) * 100
      : 0;
  }

  // ==========================================
  // NAVEGACIÓN
  // ==========================================

  irAProductos(): void {
    this.router.navigate(['/productos']);
  }

  irAEmpleados(): void {
    this.router.navigate(['/empleados']);
  }

  irAPedidos(): void {
    this.router.navigate(['/pedidos']);
  }
}
