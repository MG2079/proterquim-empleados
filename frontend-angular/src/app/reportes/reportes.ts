import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ReporteService } from '../services/reporte.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit {

  constructor(private reporteService: ReporteService) {}

  // ==========================================
  // MÉTRICAS GENERALES
  // ==========================================

  totalVentas = 0;
  totalPedidos = 0;
  totalProductos = 0;
  stockCritico = 0;

  // ==========================================
  // MÉTRICAS POR ESTADO
  // ==========================================

  pedidosRealizados = 0;
  pedidosPendientes = 0;
  valorPedidosPendientes = 0;
  pedidosCancelados = 0;
  valorPedidosCancelados = 0;

  // ==========================================
  // DATOS DE LAS TABLAS
  // ==========================================

  ventas: any[] = [];
  productosVendidos: any[] = [];
  inventarioCritico: any[] = [];
  ultimosPedidos: any[] = [];

  // ==========================================
  // CONTROL
  // ==========================================

  cargando = false;
  mensaje = '';

  ngOnInit(): void {
    this.cargarReportes();
  }

  // ==========================================
  // CARGAR TODOS LOS REPORTES
  // ==========================================

  cargarReportes(): void {
    this.cargando = true;
    this.mensaje = '';

    forkJoin({
      dashboard: this.reporteService.obtenerDashboard(),
      ventas: this.reporteService.obtenerVentas(),
      productos: this.reporteService.obtenerProductosMasVendidos(),
      inventario: this.reporteService.obtenerInventarioCritico()
    })
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (data: any) => {
          const dashboard = data.dashboard ?? {};

          this.ventas = Array.isArray(data.ventas)
            ? data.ventas
            : [];

          this.inventarioCritico = Array.isArray(data.inventario)
            ? data.inventario
            : [];

          this.ultimosPedidos = Array.isArray(dashboard.ultimosPedidos)
            ? dashboard.ultimosPedidos
            : [];

          // Pedidos por estado.
          const pedidosRealizados = this.ventas.filter(
            pedido =>
              pedido.estado === 'Procesado' ||
              pedido.estado === 'Entregado'
          );

          const pedidosPendientes = this.ventas.filter(
            pedido => pedido.estado === 'Pendiente'
          );

          const pedidosCancelados = this.ventas.filter(
            pedido => pedido.estado === 'Cancelado'
          );

          this.pedidosRealizados = pedidosRealizados.length;

          this.pedidosPendientes = pedidosPendientes.length;

          this.valorPedidosPendientes = pedidosPendientes.reduce(
            (total, pedido) =>
              total + this.moneda(pedido.total),
            0
          );

          this.pedidosCancelados = pedidosCancelados.length;

          this.valorPedidosCancelados = pedidosCancelados.reduce(
            (total, pedido) =>
              total + this.moneda(pedido.total),
            0
          );

          // Todos los pedidos registrados, incluidos los cancelados.
          this.totalPedidos = this.ventas.length;

          // Los ingresos solo incluyen pedidos procesados o entregados.
          this.totalVentas = pedidosRealizados.reduce(
            (total, pedido) =>
              total + this.moneda(pedido.total),
            0
          );

          this.totalProductos = this.moneda(
            dashboard.totalProductos
          );

          this.stockCritico = this.moneda(
            dashboard.stockBajo
          );

          // Productos vendidos únicamente en pedidos realizados.
          const productosMap = new Map<
            string,
            {
              nombre: string;
              cantidad: number;
              ingresos: number;
            }
          >();

          pedidosRealizados.forEach(pedido => {
            const productos = Array.isArray(pedido.productos)
              ? pedido.productos
              : [];

            productos.forEach((producto: any) => {
              const nombre =
                producto.nombreProducto ||
                producto.nombre ||
                'Producto sin nombre';

              const actual = productosMap.get(nombre) ?? {
                nombre,
                cantidad: 0,
                ingresos: 0
              };

              actual.cantidad += this.moneda(producto.cantidad);
              actual.ingresos += this.moneda(producto.subtotal);

              productosMap.set(nombre, actual);
            });
          });

          this.productosVendidos = Array
            .from(productosMap.values())
            .sort((a, b) => b.cantidad - a.cantidad);
        },

        error: (error) => {
          console.error('Error cargando reportes:', error);
          this.mensaje = 'No se pudieron cargar todos los reportes.';
        }
      });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  private moneda(valor: any): number {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
  }

  private fecha(valor: any): string {
    if (!valor) {
      return '';
    }

    const fecha = new Date(valor);

    return Number.isNaN(fecha.getTime())
      ? ''
      : fecha.toLocaleString('es-CO');
  }

  private estadoProducto(producto: any): string {
    const stock = this.moneda(producto.stock);

    if (stock < 20) {
      return 'Crítico';
    }

    if (stock <= 30) {
      return 'Bajo';
    }

    return 'Normal';
  }

  private crearHoja(
    datos: Record<string, any>[],
    columnas: string[]
  ): XLSX.WorkSheet {
    const filas = datos.length
      ? datos
      : [{
          Mensaje: 'No hay registros disponibles para este reporte.'
        }];

    const hoja = XLSX.utils.json_to_sheet(filas, {
      header: columnas
    });

    hoja['!cols'] = columnas.map(columna => ({
      wch: Math.max(
        columna.length + 3,
        ...filas.map(
          fila => String(fila[columna] ?? '').length + 2
        )
      )
    }));

    return hoja;
  }

  // ==========================================
  // EXPORTAR EXCEL
  // ==========================================

  exportarExcel(): void {
    const libro = XLSX.utils.book_new();
    const fechaGeneracion = new Date().toLocaleString('es-CO');

    // Hoja 1: Resumen.
    const resumen = [
      {
        Indicador: 'Empresa',
        Valor: 'Proterquim de Colombia S.A.S'
      },
      {
        Indicador: 'Fecha de generación',
        Valor: fechaGeneracion
      },
      {
        Indicador: 'Ventas realizadas (COP)',
        Valor: this.totalVentas
      },
      {
        Indicador: 'Pedidos registrados',
        Valor: this.totalPedidos
      },
      {
        Indicador: 'Pedidos procesados o entregados',
        Valor: this.pedidosRealizados
      },
      {
        Indicador: 'Pedidos pendientes',
        Valor: this.pedidosPendientes
      },
      {
        Indicador: 'Valor de pedidos pendientes (COP)',
        Valor: this.valorPedidosPendientes
      },
      {
        Indicador: 'Pedidos cancelados',
        Valor: this.pedidosCancelados
      },
      {
        Indicador: 'Valor excluido de ventas por cancelaciones (COP)',
        Valor: this.valorPedidosCancelados
      },
      {
        Indicador: 'Total de productos registrados',
        Valor: this.totalProductos
      },
      {
        Indicador: 'Productos con stock bajo o crítico',
        Valor: this.stockCritico
      }
    ];

    XLSX.utils.book_append_sheet(
      libro,
      this.crearHoja(resumen, ['Indicador', 'Valor']),
      'Resumen'
    );

    // Hoja 2: Ventas y pedidos registrados.
    const ventas = this.ventas.map(pedido => ({
      Pedido: pedido._id ?? '',
      Cliente: pedido.cliente ?? '',
      Fecha: this.fecha(pedido.createdAt ?? pedido.fecha),
      Estado: pedido.estado ?? '',
      TotalCOP: this.moneda(pedido.total)
    }));

    XLSX.utils.book_append_sheet(
      libro,
      this.crearHoja(
        ventas,
        ['Pedido', 'Cliente', 'Fecha', 'Estado', 'TotalCOP']
      ),
      'Ventas'
    );

    // Hoja 3: Productos vendidos.
    const vendidos = this.productosVendidos.map(producto => ({
      Producto: producto.nombre ?? '',
      UnidadesVendidas: this.moneda(producto.cantidad),
      IngresosCOP: this.moneda(producto.ingresos)
    }));

    XLSX.utils.book_append_sheet(
      libro,
      this.crearHoja(
        vendidos,
        ['Producto', 'UnidadesVendidas', 'IngresosCOP']
      ),
      'Productos vendidos'
    );

    // Hoja 4: Inventario bajo o crítico.
    const inventario = this.inventarioCritico.map(producto => ({
      Producto: producto.nombre ?? '',
      Stock: this.moneda(producto.stock),
      StockMinimo: this.moneda(producto.stockMinimo ?? 20),
      Estado: this.estadoProducto(producto),
      Categoria: producto.categoria ?? ''
    }));

    XLSX.utils.book_append_sheet(
      libro,
      this.crearHoja(
        inventario,
        ['Producto', 'Stock', 'StockMinimo', 'Estado', 'Categoria']
      ),
      'Inventario crítico'
    );

    // Hoja 5: Últimos pedidos.
    const recientes = this.ultimosPedidos.map(pedido => ({
      Pedido: pedido._id ?? '',
      Cliente: pedido.cliente ?? '',
      Fecha: this.fecha(pedido.createdAt ?? pedido.fecha),
      Estado: pedido.estado ?? '',
      TotalCOP: this.moneda(pedido.total)
    }));

    XLSX.utils.book_append_sheet(
      libro,
      this.crearHoja(
        recientes,
        ['Pedido', 'Cliente', 'Fecha', 'Estado', 'TotalCOP']
      ),
      'Últimos pedidos'
    );

    XLSX.writeFile(libro, 'reportes-proterquim.xlsx');
  }

  // ==========================================
  // EXPORTAR PDF
  // ==========================================

  async exportarPDF(): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const ancho = doc.internal.pageSize.getWidth();
    const margen = 15;
    let y = 15;

    // Logo corporativo.
    try {
      const logo = await this.cargarLogo('assets/logo.png');
      doc.addImage(logo, 'PNG', margen, y, 22, 22);
    } catch (error) {
      console.warn(
        'No se pudo cargar el logo; se continuará sin él.',
        error
      );
    }

    // Encabezado.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(33, 37, 41);
    doc.text('Proterquim de Colombia S.A.S', 42, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Generado: ${new Date().toLocaleString('es-CO')}`,
      42,
      y + 16
    );

    y = 43;

    doc.setDrawColor(60, 160, 242);
    doc.setLineWidth(1);
    doc.line(margen, y, ancho - margen, y);

    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Reporte general', margen, y);

    y += 9;

    // Resumen de indicadores.
    const resumen = [
      [
        'Ventas realizadas',
        `COP ${this.totalVentas.toLocaleString('es-CO')}`
      ],
      [
        'Pedidos registrados',
        String(this.totalPedidos)
      ],
      [
        'Pedidos procesados o entregados',
        String(this.pedidosRealizados)
      ],
      [
        'Pedidos pendientes',
        String(this.pedidosPendientes)
      ],
      [
        'Valor de pedidos pendientes',
        `COP ${this.valorPedidosPendientes.toLocaleString('es-CO')}`
      ],
      [
        'Pedidos cancelados',
        String(this.pedidosCancelados)
      ],
      [
        'Valor excluido por cancelaciones',
        `COP ${this.valorPedidosCancelados.toLocaleString('es-CO')}`
      ],
      [
        'Productos registrados',
        String(this.totalProductos)
      ],
      [
        'Productos con stock bajo o crítico',
        String(this.stockCritico)
      ]
    ];

    autoTable(doc, {
      startY: y,
      head: [['Indicador', 'Resultado']],
      body: resumen,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [60, 160, 242]
      },
      margin: {
        left: margen,
        right: margen
      }
    });

    y = (doc as any).lastAutoTable.finalY + 9;

    // Productos más vendidos.
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Productos más vendidos', margen, y);

    y += 3;

    autoTable(doc, {
      startY: y,
      head: [['Producto', 'Unidades', 'Ingresos (COP)']],
      body: this.productosVendidos.length
        ? this.productosVendidos.map(producto => [
            producto.nombre ?? '',
            this.moneda(producto.cantidad),
            this.moneda(producto.ingresos).toLocaleString('es-CO')
          ])
        : [['Sin registros de productos vendidos', '', '']],
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [60, 160, 242]
      },
      margin: {
        left: margen,
        right: margen
      }
    });

    y = (doc as any).lastAutoTable.finalY + 9;

    // Inventario bajo o crítico.
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Inventario bajo o crítico', margen, y);

    y += 3;

    autoTable(doc, {
      startY: y,
      head: [['Producto', 'Stock', 'Mínimo', 'Estado']],
      body: this.inventarioCritico.length
        ? this.inventarioCritico.map(producto => [
            producto.nombre ?? '',
            this.moneda(producto.stock),
            this.moneda(producto.stockMinimo ?? 20),
            this.estadoProducto(producto)
          ])
        : [['Sin productos con stock bajo o crítico', '', '', '']],
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [60, 160, 242]
      },
      margin: {
        left: margen,
        right: margen
      }
    });

    y = (doc as any).lastAutoTable.finalY + 9;

    // Últimos pedidos.
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Últimos pedidos', margen, y);

    y += 3;

    autoTable(doc, {
      startY: y,
      head: [['Cliente', 'Fecha', 'Estado', 'Total (COP)']],
      body: this.ultimosPedidos.length
        ? this.ultimosPedidos.map(pedido => [
            pedido.cliente ?? '',
            this.fecha(pedido.createdAt ?? pedido.fecha),
            pedido.estado ?? '',
            this.moneda(pedido.total).toLocaleString('es-CO')
          ])
        : [['Sin pedidos registrados', '', '', '']],
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [60, 160, 242]
      },
      margin: {
        left: margen,
        right: margen
      }
    });

    // Numeración de páginas.
    const paginas = doc.getNumberOfPages();

    for (let pagina = 1; pagina <= paginas; pagina++) {
      doc.setPage(pagina);
      doc.setFontSize(8);
      doc.setTextColor(100);

      doc.text(
        `Página ${pagina} de ${paginas}`,
        ancho - margen,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );
    }

    doc.save('reporte-general.pdf');
  }

  // ==========================================
  // CARGAR LOGO
  // ==========================================

  private cargarLogo(ruta: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const imagen = new Image();

      imagen.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = imagen.naturalWidth;
        canvas.height = imagen.naturalHeight;

        const contexto = canvas.getContext('2d');

        if (!contexto) {
          reject(new Error('No fue posible procesar el logo.'));
          return;
        }

        contexto.drawImage(imagen, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      imagen.onerror = () => {
        reject(new Error('No se pudo cargar el logo.'));
      };

      imagen.src = ruta;
    });
  }
}
