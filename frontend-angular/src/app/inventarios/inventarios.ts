import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Subscription
} from 'rxjs';

import jsPDF from 'jspdf';

import autoTable
from 'jspdf-autotable';

import * as XLSX
from 'xlsx';

import {

  ProductoService,

  Producto

} from '../services/producto.service';

import {
  SearchService
} from '../services/search.service';

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

export class InventariosComponent
implements OnInit, OnDestroy {

  // 📦 DATOS

  inventarios: any[] = [];

  inventariosFiltrados:
  any[] = [];

  // 📊 MÉTRICAS

  totalProductos = 0;

  stockBajo = 0;

  stockNormal = 0;

  stockCritico = 0;

  valorInventario = 0;

  ultimaActualizacion =
    new Date();

  // 🔄 CONTROL

  cargando = false;

  mensaje = '';

  filtro = '';

  private searchSubscription!:
  Subscription;

  constructor(

    private productoService:
    ProductoService,

    private searchService:
    SearchService

  ) {}

  // 🚀 INIT

  ngOnInit(): void {

    this.cargarInventarios();

    // 🔍 BUSCADOR GLOBAL

    this.searchSubscription =

      this.searchService
        .termino$

        .subscribe(

          (texto) => {

            this.filtro =
              texto;

            this.filtrarInventario();

          }

        );

  }

  // 🧹 DESTROY

  ngOnDestroy(): void {

    if (
      this.searchSubscription
    ) {

      this.searchSubscription
        .unsubscribe();

    }

  }

  // 📦 CARGAR INVENTARIOS

  cargarInventarios(): void {

    this.cargando = true;

    this.productoService

      .obtenerProductos()

      .subscribe({

        next: (
          productos: Producto[]
        ) => {

          this.inventarios =

            productos.map(

              (producto: any) => {

                let estado =
                  'Normal';

                if (
                  producto.stock <= 10
                ) {

                  estado =
                    'Crítico';

                }

                else if (
                  producto.stock <= 20
                ) {

                  estado =
                    'Bajo';

                }

                return {

                  producto:
                    producto.nombre,

                  descripcion:
                    producto.descripcion,

                  categoria:

                    producto.categoria ||

                    'General',

                  precio:
                    producto.precio,

                  stock:
                    producto.stock,

                  minimo: 20,

                  estado,

                  fecha:
                    new Date()

                };

              }

            );

          // 🔥 ORDENAR

          this.inventarios.sort(

            (a, b) => {

              const prioridad: any = {

                Crítico: 1,

                Bajo: 2,

                Normal: 3

              };

              return (

                prioridad[a.estado] -

                prioridad[b.estado]

              );

            }

          );

          this.filtrarInventario();

          this.calcularMetricas();

          this.ultimaActualizacion =
            new Date();

          this.cargando = false;

        },

        error: (error) => {

          console.error(error);

          this.mensaje =
            'Error al cargar inventario';

          this.cargando = false;

        }

      });

  }

  // 🔍 FILTRAR INVENTARIO

  filtrarInventario(): void {

    if (!this.filtro) {

      this.inventariosFiltrados =

        [...this.inventarios];

      return;

    }

    const texto =
      this.filtro.toLowerCase();

    this.inventariosFiltrados =

      this.inventarios.filter(

        (item: any) =>

          item.producto
            ?.toLowerCase()
            .includes(texto)

          ||

          item.categoria
            ?.toLowerCase()
            .includes(texto)

          ||

          item.estado
            ?.toLowerCase()
            .includes(texto)

      );

  }

  // 📊 CALCULAR MÉTRICAS

  calcularMetricas(): void {

    this.totalProductos =
      this.inventarios.length;

    this.stockBajo =

      this.inventarios.filter(

        item =>

          item.estado ===
          'Bajo'

      ).length;

    this.stockNormal =

      this.inventarios.filter(

        item =>

          item.estado ===
          'Normal'

      ).length;

    this.stockCritico =

      this.inventarios.filter(

        item =>

          item.estado ===
          'Crítico'

      ).length;

    this.valorInventario =

      this.inventarios.reduce(

        (total, item) => {

          return total +

            (

              (item.stock || 0) *

              (item.precio || 0)

            );

        },

        0

      );

  }

  // 🎨 CLASE STOCK

  obtenerClaseStock():
  string {

    if (

      this.stockCritico > 0

    ) {

      return 'critico';

    }

    if (

      this.stockBajo > 0

    ) {

      return 'bajo';

    }

    return 'card-success';

  }

  // 🔄 RECARGAR

  recargarInventario():
  void {

    this.cargarInventarios();

  }

  // 📄 EXPORTAR PDF

  exportarPDF(): void {

    const doc =
      new jsPDF();

    const logo =
      new Image();

    logo.src =
      'assets/logo.png';

    logo.onload = () => {

      doc.addImage(

        logo,

        'PNG',

        15,

        10,

        22,

        22

      );

      doc.setFontSize(20);

      doc.setTextColor(

        30,

        41,

        59

      );

      doc.text(

        'Proterquim de Colombia S.A.S',

        45,

        22

      );

      doc.setDrawColor(

        74,

        144,

        226

      );

      doc.setLineWidth(1);

      doc.line(

        15,

        38,

        195,

        38

      );

      doc.setFontSize(18);

      doc.text(

        'Reporte de Inventario',

        15,

        52

      );

      doc.setFontSize(11);

      doc.text(

        `Fecha: ${new Date().toLocaleDateString()}`,

        15,

        62

      );

      autoTable(doc, {

        startY: 75,

        head: [[

          'Producto',

          'Categoria',

          'Precio',

          'Stock',

          'Estado'

        ]],

        body:

          this.inventariosFiltrados.map(

            (item: any) => [

              item.producto,

              item.categoria,

              item.precio,

              item.stock,

              item.estado

            ]

          ),

        headStyles: {

          fillColor: [

            74,

            144,

            226

          ]

        }

      });

      doc.save(

        'inventario-proterquim.pdf'

      );

    };

  }

  // 📊 EXPORTAR EXCEL

  exportarExcel(): void {

    const datos =

      this.inventariosFiltrados.map(

        (item: any) => ({

          Producto:
            item.producto,

          Categoria:
            item.categoria,

          Precio:
            item.precio,

          Stock:
            item.stock,

          Estado:
            item.estado

        })

      );

    const worksheet =

      XLSX.utils.json_to_sheet(
        datos
      );

    const workbook =

      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      'Inventario'

    );

    XLSX.writeFile(

      workbook,

      'inventario-proterquim.xlsx'

    );

  }

}