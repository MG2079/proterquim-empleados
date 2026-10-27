import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import {
  ProductoService,
  Producto,
  EstadoProducto
} from '../services/producto.service';

import { SearchService } from '../services/search.service';

interface ItemInventario {
  id?: string;
  producto: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  minimo: number;
  estado: EstadoProducto;
  fecha: Date | null;
}

@Component({
  selector: 'app-inventarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './inventarios.html',
  styleUrls: ['./inventarios.css']
})
export class InventariosComponent implements OnInit, OnDestroy {

  // DATOS
  inventarios: ItemInventario[] = [];
  inventariosFiltrados: ItemInventario[] = [];

  // MÉTRICAS
  totalProductos = 0;
  stockBajo = 0;
  stockNormal = 0;
  stockCritico = 0;
  valorInventario = 0;
  ultimaActualizacion: Date | null = null;

  // CONTROL
  cargando = false;
  mensaje = '';
  filtro = '';

  private searchSubscription?: Subscription;

  constructor(
    private productoService: ProductoService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchService.termino$.subscribe(
      (texto: string) => {
        this.filtro = texto;
        this.filtrarInventario();
      }
    );

    this.cargarInventarios();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  // CARGAR INVENTARIO DESDE EL BACKEND
  cargarInventarios(): void {
    this.cargando = true;
    this.mensaje = '';

    this.productoService.obtenerProductos().subscribe({
      next: (productos: Producto[]) => {
        this.inventarios = productos.map((producto: Producto) => {
          const stock = Number(producto.stock) || 0;
          const minimo = Number(producto.stockMinimo ?? 20);

          const fechaOriginal =
            producto.updatedAt ?? producto.createdAt ?? null;

          const fecha = fechaOriginal
            ? new Date(fechaOriginal)
            : null;

          return {
            id: producto._id,
            producto: producto.nombre,
            descripcion: producto.descripcion,
            categoria: producto.categoria || 'General',
            precio: Number(producto.precio) || 0,
            stock,
            minimo,
            estado: this.productoService.calcularEstado(stock, minimo),
            fecha:
              fecha && !Number.isNaN(fecha.getTime())
                ? fecha
                : null
          };
        });

        // PRIORIDAD: CRÍTICO, BAJO, NORMAL
        const prioridad: Record<EstadoProducto, number> = {
          'Crítico': 1,
          'Bajo': 2,
          'Normal': 3
        };

        this.inventarios.sort(
          (a, b) => prioridad[a.estado] - prioridad[b.estado]
        );

        this.calcularMetricas();
        this.filtrarInventario();

        this.ultimaActualizacion = new Date();
        this.cargando = false;
      },
      error: (error: unknown) => {
        console.error('Error al cargar inventario:', error);
        this.mensaje = 'No fue posible cargar el inventario. Intenta nuevamente.';
        this.cargando = false;
      }
    });
  }

  // FILTRAR POR PRODUCTO, CATEGORÍA O ESTADO
  filtrarInventario(): void {
    const texto = this.filtro.trim().toLocaleLowerCase();

    if (!texto) {
      this.inventariosFiltrados = [...this.inventarios];
      return;
    }

    this.inventariosFiltrados = this.inventarios.filter(item =>
      item.producto.toLocaleLowerCase().includes(texto) ||
      item.descripcion.toLocaleLowerCase().includes(texto) ||
      item.categoria.toLocaleLowerCase().includes(texto) ||
      item.estado.toLocaleLowerCase().includes(texto)
    );
  }

  // CALCULAR MÉTRICAS GENERALES
  calcularMetricas(): void {
    this.totalProductos = this.inventarios.length;

    this.stockCritico = this.inventarios.filter(
      item => item.estado === 'Crítico'
    ).length;

    this.stockBajo = this.inventarios.filter(
      item => item.estado === 'Bajo'
    ).length;

    this.stockNormal = this.inventarios.filter(
      item => item.estado === 'Normal'
    ).length;

    this.valorInventario = this.inventarios.reduce(
      (total, item) => total + item.stock * item.precio,
      0
    );
  }

  // CLASE PARA DESTACAR LAS TARJETAS DE ATENCIÓN
  obtenerClaseStock(): string {
    if (this.stockCritico > 0) {
      return 'critico';
    }

    if (this.stockBajo > 0) {
      return 'bajo';
    }

    return 'card-success';
  }

  // BARRA DE STOCK LIMITADA ENTRE 0 Y 100 %
  obtenerPorcentajeStock(stock: number): number {
    if (!Number.isFinite(stock) || stock <= 0) {
      return 0;
    }

    return Math.min(stock, 100);
  }

  // ACTUALIZAR INVENTARIO
  recargarInventario(): void {
    this.cargarInventarios();
  }

  // DATOS COMUNES PARA LOS INFORMES
  private obtenerDatosInforme(): ItemInventario[] {
    return [...this.inventariosFiltrados];
  }

  private obtenerResumenInforme(datos: ItemInventario[]) {
    return {
      totalProductos: datos.length,
      stockCritico: datos.filter(
        item => item.estado === 'Crítico'
      ).length,
      stockBajo: datos.filter(
        item => item.estado === 'Bajo'
      ).length,
      stockNormal: datos.filter(
        item => item.estado === 'Normal'
      ).length,
      valorInventario: datos.reduce(
        (total, item) => total + item.stock * item.precio,
        0
      )
    };
  }

  // EXPORTAR EXCEL CON RESUMEN Y DETALLE
  exportarExcel(): void {
    const datos = this.obtenerDatosInforme();

    if (datos.length === 0) {
      this.mensaje = 'No hay productos para exportar con los filtros actuales.';
      return;
    }

    this.mensaje = '';

    const resumen = this.obtenerResumenInforme(datos);

    const hojaResumen = XLSX.utils.aoa_to_sheet([
      ['PROTERQUIM DE COLOMBIA S.A.S.'],
      ['REPORTE DE INVENTARIO'],
      ['Fecha de generación', new Date().toLocaleString('es-CO')],
      [''],
      ['INDICADORES'],
      ['Total de productos', resumen.totalProductos],
      ['Productos críticos', resumen.stockCritico],
      ['Productos con stock bajo', resumen.stockBajo],
      ['Productos con stock normal', resumen.stockNormal],
      ['Valor total del inventario (COP)', resumen.valorInventario],
      [''],
      ['Filtro aplicado', this.filtro.trim() || 'Ninguno']
    ]);

    hojaResumen['!cols'] = [
      { wch: 38 },
      { wch: 30 }
    ];

    const detalle = datos.map(item => ({
      Producto: item.producto,
      Descripcion: item.descripcion,
      Categoria: item.categoria,
      Precio_COP: item.precio,
      Stock_Actual: item.stock,
      Stock_Minimo: item.minimo,
      Estado: item.estado,
      Valor_Stock_COP: item.stock * item.precio,
      Ultima_Actualizacion: item.fecha
        ? item.fecha.toLocaleString('es-CO')
        : 'Sin fecha registrada'
    }));

    const hojaDetalle = XLSX.utils.json_to_sheet(detalle);

    hojaDetalle['!cols'] = [
      { wch: 28 },
      { wch: 42 },
      { wch: 20 },
      { wch: 16 },
      { wch: 15 },
      { wch: 15 },
      { wch: 16 },
      { wch: 20 },
      { wch: 25 }
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hojaResumen,
      'Resumen'
    );

    XLSX.utils.book_append_sheet(
      libro,
      hojaDetalle,
      'Detalle inventario'
    );

    XLSX.writeFile(
      libro,
      'inventario-proterquim.xlsx'
    );
  }

  // EXPORTAR PDF FORMAL CON LOGOTIPO, RESUMEN Y DETALLE
  exportarPDF(): void {
    const datos = this.obtenerDatosInforme();

    if (datos.length === 0) {
      this.mensaje = 'No hay productos para exportar con los filtros actuales.';
      return;
    }

    this.mensaje = '';

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const resumen = this.obtenerResumenInforme(datos);
    const fechaGeneracion = new Date().toLocaleString('es-CO');

    // Genera el informe una sola vez. Si el logo no carga, el reporte
    // se exporta igualmente, con el nombre de la empresa como encabezado.
    const dibujarContenido = (logoBase64?: string): void => {
      if (logoBase64) {
        // Logo corporativo: mantener proporción dentro de un área de 22 x 22 mm.
        doc.addImage(logoBase64, 'PNG', 15, 7, 22, 22);
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text('PROTERQUIM DE COLOMBIA S.A.S.', 42, 19);
      } else {
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text('PROTERQUIM DE COLOMBIA S.A.S.', 15, 17);
      }

      // Título del informe
doc.setFontSize(12);
doc.setTextColor(30, 41, 59);
doc.text('REPORTE DE INVENTARIO', 15, 36);

// Fecha de generación
doc.setFontSize(9);
doc.text(`Generado: ${fechaGeneracion}`, 15, 41);

// Filtro aplicado
doc.text(
  `Filtro aplicado: ${this.filtro.trim() || 'Ninguno'}`,
  15,
  46
);

// Separador del encabezado
doc.setDrawColor(74, 144, 226);
doc.setLineWidth(0.8);
doc.line(15, 51, 282, 51);

      autoTable(doc, {
        startY: 56,
        head: [['Indicador', 'Cantidad / Valor']],
        body: [
          ['Total de productos', String(resumen.totalProductos)],
          ['Productos críticos', String(resumen.stockCritico)],
          ['Productos con stock bajo', String(resumen.stockBajo)],
          ['Productos con stock normal', String(resumen.stockNormal)],
          [
            'Valor total del inventario',
            resumen.valorInventario.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0
            })
          ]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [74, 144, 226]
        },
        margin: {
          left: 15,
          right: 15
        }
      });

      const tablaResumen = (
        doc as jsPDF & { lastAutoTable?: { finalY: number } }
      ).lastAutoTable;

      const inicioDetalle = (tablaResumen?.finalY ?? 95) + 8;

      autoTable(doc, {
        startY: inicioDetalle,
        head: [[
          'Producto',
          'Categoría',
          'Precio COP',
          'Stock',
          'Mínimo',
          'Valor stock COP',
          'Estado',
          'Última actualización'
        ]],
        body: datos.map(item => [
          item.producto,
          item.categoria,
          item.precio.toLocaleString('es-CO'),
          String(item.stock),
          String(item.minimo),
          (item.stock * item.precio).toLocaleString('es-CO'),
          item.estado,
          item.fecha
            ? item.fecha.toLocaleString('es-CO')
            : 'Sin fecha'
        ]),
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [74, 144, 226]
        },
        margin: {
          left: 15,
          right: 15,
          bottom: 14
        },
        didDrawPage: () => {
          const pagina = doc.getNumberOfPages();
          const alto = doc.internal.pageSize.getHeight();
          const ancho = doc.internal.pageSize.getWidth();

          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            `ProterquimERP | Página ${pagina}`,
            ancho - 15,
            alto - 7,
            { align: 'right' }
          );
        }
      });

      doc.save('inventario-proterquim.pdf');
    };

    // Ruta absoluta desde la aplicación Angular para localizar assets/logo.png.
    const logo = new Image();
    logo.crossOrigin = 'anonymous';

    logo.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logo.naturalWidth || logo.width;
        canvas.height = logo.naturalHeight || logo.height;

        const contexto = canvas.getContext('2d');
        if (!contexto) {
          console.error('No se pudo crear el contexto para procesar el logotipo.');
          dibujarContenido();
          return;
        }

        contexto.drawImage(logo, 0, 0);
        const logoBase64 = canvas.toDataURL('image/png');
        dibujarContenido(logoBase64);
      } catch (error) {
        console.error('Error al procesar el logotipo:', error);
        dibujarContenido();
      }
    };

    logo.onerror = () => {
      console.error('No se pudo cargar el logotipo desde /assets/logo.png.');
      dibujarContenido();
    };

    logo.src = `${window.location.origin}/assets/logo.png`;
  }
}
