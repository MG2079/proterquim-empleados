import {

  Component,
  OnInit

} from '@angular/core';

import {

  CommonModule

} from '@angular/common';

import {

  ReporteService

} from '../services/reporte.service';

// 🔥 PDF
import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

// 🔥 EXCEL
import * as XLSX from 'xlsx';

@Component({

  selector: 'app-reportes',

  standalone: true,

  imports: [

    CommonModule

  ],

  templateUrl: './reportes.html',

  styleUrls: ['./reportes.css']

})

export class ReportesComponent
implements OnInit {

  constructor(

    private reporteService:
      ReporteService

  ) {}

  // ==========================================
  // 🔥 MÉTRICAS
  // ==========================================

  totalVentas = 0;

  totalPedidos = 0;

  totalProductos = 0;

  stockCritico = 0;

  // ==========================================
  // 🔥 TABLAS
  // ==========================================

  ventas: any[] = [];

  productosVendidos: any[] = [];

  inventarioCritico: any[] = [];

  ultimosPedidos: any[] = [];

  // ==========================================
  // 🔥 CONTROL
  // ==========================================

  cargando = false;

  mensaje = '';

  ngOnInit(): void {

    this.cargarDashboard();

    this.cargarVentas();

    this.cargarProductosVendidos();

    this.cargarInventarioCritico();

  }

  // ==========================================
  // 🔥 DASHBOARD
  // ==========================================

  cargarDashboard(): void {

    this.cargando = true;

    this.reporteService
      .obtenerDashboard()

      .subscribe({

        next: (data) => {

          this.totalVentas =
            data.ventasTotales;

          this.totalPedidos =
            data.totalPedidos;

          this.totalProductos =
            data.totalProductos;

          this.stockCritico =
            data.stockBajo;

          this.ultimosPedidos =
            data.ultimosPedidos;

          this.cargando = false;

        },

        error: (error) => {

          console.log(error);

          this.mensaje =
            'Error cargando dashboard';

          this.cargando = false;

        }

      });

  }

  // ==========================================
  // 🔥 VENTAS
  // ==========================================

  cargarVentas(): void {

    this.reporteService
      .obtenerVentas()

      .subscribe({

        next: (data) => {

          this.ventas = data;

        },

        error: (error) => {

          console.log(error);

        }

      });

  }

  // ==========================================
  // 🔥 PRODUCTOS MÁS VENDIDOS
  // ==========================================

  cargarProductosVendidos(): void {

    this.reporteService
      .obtenerProductosMasVendidos()

      .subscribe({

        next: (data) => {

          this.productosVendidos =
            data;

        },

        error: (error) => {

          console.log(error);

        }

      });

  }

  // ==========================================
  // 🔥 INVENTARIO CRÍTICO
  // ==========================================

  cargarInventarioCritico(): void {

    this.reporteService
      .obtenerInventarioCritico()

      .subscribe({

        next: (data) => {

          this.inventarioCritico =
            data;

        },

        error: (error) => {

          console.log(error);

        }

      });

  }

  // ==========================================
  // 🔥 EXPORTAR EXCEL
  // ==========================================

  exportarExcel(): void {

    const datos = this.productosVendidos.map(

      producto => ({

        Producto:
          producto.nombre,

        Cantidad:
          producto.cantidad,

        Ingresos:
          producto.ingresos

      })

    );

    const worksheet =
      XLSX.utils.json_to_sheet(datos);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      'Reportes'

    );

    XLSX.writeFile(

      workbook,

      'reportes.xlsx'

    );

  }

  // ==========================================
// 🔥 EXPORTAR PDF
// ==========================================

exportarPDF(): void {

  const doc = new jsPDF();

  const logo = new Image();

  logo.src = 'assets/logo.png';

  logo.onload = () => {

    // ==========================================
    // 🔥 LOGO
    // ==========================================

    doc.addImage(

      logo,

      'PNG',

      15,

      10,

      25,

      25

    );

    // ==========================================
    // 🔥 NOMBRE EMPRESA
    // ==========================================

    doc.setFontSize(22);

    doc.setTextColor(33, 37, 41);

    doc.text(

      'Proterquim de Colombia S.A.S',

      50,

      22

    );

    // ==========================================
    // 🔥 LÍNEA
    // ==========================================

    doc.setDrawColor(74, 144, 226);

    doc.setLineWidth(1);

    doc.line(

      15,

      40,

      195,

      40

    );

    // ==========================================
    // 🔥 TÍTULO
    // ==========================================

    doc.setFontSize(18);

    doc.text(

      'Reporte General',

      15,

      55

    );

    // ==========================================
    // 🔥 FECHA
    // ==========================================

    doc.setFontSize(11);

    doc.text(

      `Fecha: ${new Date().toLocaleDateString()}`,

      15,

      65

    );

    // ==========================================
    // 🔥 MÉTRICAS
    // ==========================================

    doc.text(

      `Ventas Totales: COP ${this.totalVentas}`,

      15,

      82

    );

    doc.text(

      `Pedidos: ${this.totalPedidos}`,

      15,

      92

    );

    doc.text(

      `Productos: ${this.totalProductos}`,

      15,

      102

    );

    doc.text(

      `Stock Crítico: ${this.stockCritico}`,

      15,

      112

    );

    // ==========================================
    // 🔥 TABLA
    // ==========================================

    autoTable(doc, {

      startY: 125,

      head: [[

        'Producto',

        'Cantidad',

        'Ingresos'

      ]],

      body: this.productosVendidos.map(

        producto => [

          producto.nombre,

          producto.cantidad,

          `COP ${producto.ingresos}`

        ]

      ),

      theme: 'grid',

      headStyles: {

        fillColor: [74, 144, 226]

      }

    });

    // ==========================================
    // 🔥 GUARDAR
    // ==========================================

    doc.save(

      'reporte-general.pdf'

    );

  }; 

}

}