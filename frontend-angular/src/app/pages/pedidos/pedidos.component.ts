import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  PedidoService
} from '../../services/pedido.service';

import {
  ProductoService
} from '../../services/producto.service';

@Component({

  selector: 'app-pedidos',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './pedidos.component.html',

  styleUrls: [
    './pedidos.component.css'
  ]

})

export class PedidosComponent
implements OnInit {

  // 🧾 PEDIDOS

  pedidos: any[] = [];

  // 📦 PRODUCTOS

  productosDisponibles:
  any[] = [];

  productoSeleccionado:
  any = null;

  // 📊 STOCK

  stockDisponible = 0;

  cantidadSeleccionada = 1;

  // 🔄 CONTROL

  cargando = false;

  // ➕ NUEVO PEDIDO

  nuevoPedido = {

    cliente: '',

    productos: [] as any[],

    total: 0

  };

  constructor(

    private pedidoService:
    PedidoService,

    private productoService:
    ProductoService

  ) {}

  ngOnInit(): void {

    this.obtenerPedidos();

    this.obtenerProductos();

  }

  // 🧾 OBTENER PEDIDOS

  obtenerPedidos(): void {

    this.pedidoService

      .obtenerPedidos()

      .subscribe({

        next: (pedidos) => {

          this.pedidos =
            pedidos;

        },

        error: (error) => {

          console.error(

            'Error obteniendo pedidos:',

            error

          );

        }

      });

  }

  // 📦 OBTENER PRODUCTOS

  obtenerProductos(): void {

    this.productoService

      .obtenerProductos()

      .subscribe({

        next: (productos) => {

          this.productosDisponibles =
            productos;

        },

        error: (error) => {

          console.error(

            'Error obteniendo productos:',

            error

          );

        }

      });

  }

  // 📊 ACTUALIZAR STOCK

  actualizarStock(): void {

    if (
      this.productoSeleccionado
    ) {

      this.stockDisponible =

        Number(

          this.productoSeleccionado
            .stock

        );

    }

    else {

      this.stockDisponible = 0;

    }

  }

  // ➕ AGREGAR PRODUCTO

  agregarProducto(): void {

    if (
      !this.productoSeleccionado
    ) {

      alert(
        'Seleccione un producto'
      );

      return;

    }

    if (
      this.cantidadSeleccionada <= 0
    ) {

      alert(
        'Ingrese una cantidad válida'
      );

      return;

    }

    if (

      this.cantidadSeleccionada >

      this.stockDisponible

    ) {

      alert(
        'Stock insuficiente'
      );

      return;

    }

    const subtotal =

      Number(
        this.productoSeleccionado
          .precio
      )

      *

      Number(
        this.cantidadSeleccionada
      );

    const productoPedido = {

      producto:
        this.productoSeleccionado
          ._id,

      nombreProducto:
        this.productoSeleccionado
          .nombre,

      precioUnitario:

        Number(
          this.productoSeleccionado
            .precio
        ),

      cantidad:

        Number(
          this.cantidadSeleccionada
        ),

      subtotal:
        Number(subtotal)

    };

    this.nuevoPedido.productos = [

      ...this.nuevoPedido
        .productos,

      productoPedido

    ];

    this.calcularTotal();

    this.stockDisponible =

      this.stockDisponible -

      this.cantidadSeleccionada;

    this.limpiarSeleccionProducto();

  }

  // 💰 CALCULAR TOTAL

  calcularTotal(): void {

    this.nuevoPedido.total =

      this.nuevoPedido
        .productos

        .reduce(

          (

            total: number,

            producto: any

          ) => {

            return total +

              Number(
                producto.subtotal
              );

          },

          0

        );

  }

  // ✏️ EDITAR PRODUCTO

  editarProducto(
    index: number
  ): void {

    const producto =

      this.nuevoPedido
        .productos[index];

    this.productoSeleccionado = {

      _id:
        producto.producto,

      nombre:
        producto.nombreProducto,

      precio:
        producto.precioUnitario,

      stock:

        this.stockDisponible +

        producto.cantidad

    };

    this.cantidadSeleccionada =

      producto.cantidad;

    this.stockDisponible =

      this.productoSeleccionado
        .stock;

    this.nuevoPedido
      .productos

      .splice(index, 1);

    this.nuevoPedido.productos = [

      ...this.nuevoPedido
        .productos

    ];

    this.calcularTotal();

  }

  // 🗑 ELIMINAR PRODUCTO

  eliminarProducto(
    index: number
  ): void {

    const confirmar = confirm(

      '¿Desea eliminar este producto?'

    );

    if (!confirmar) {

      return;

    }

    this.nuevoPedido
      .productos

      .splice(index, 1);

    this.nuevoPedido.productos = [

      ...this.nuevoPedido
        .productos

    ];

    this.calcularTotal();

  }

  // ➕ CREAR PEDIDO

  crearPedido(): void {

    if (
      !this.validarPedido()
    ) {

      return;

    }

    this.cargando = true;

    this.pedidoService

      .crearPedido(
        this.nuevoPedido
      )

      .subscribe({

        next: () => {

          this.obtenerPedidos();

          this.obtenerProductos();

          this.limpiarFormulario();

          this.cargando = false;

          alert(
            'Pedido creado correctamente'
          );

        },

        error: (error) => {

          console.error(

            'Error al crear pedido:',

            error

          );

          this.cargando = false;

          alert(
            'Error al crear el pedido'
          );

        }

      });

  }

  // ✅ VALIDAR PEDIDO

  validarPedido(): boolean {

    if (

      !this.nuevoPedido
        .cliente
        .trim()

    ) {

      alert(
        'Debe ingresar un cliente'
      );

      return false;

    }

    if (

      this.nuevoPedido
        .productos.length === 0

    ) {

      alert(
        'Debe agregar productos'
      );

      return false;

    }

    if (

      this.nuevoPedido.total <= 0

    ) {

      alert(
        'Total inválido'
      );

      return false;

    }

    return true;

  }

  // 🗑 ELIMINAR PEDIDO

  eliminarPedido(
    id: string
  ): void {

    const confirmar = confirm(

      '¿Desea eliminar este pedido?'

    );

    if (!confirmar) {

      return;

    }

    this.pedidoService

      .eliminarPedido(id)

      .subscribe({

        next: () => {

          this.obtenerPedidos();

          alert(
            'Pedido eliminado'
          );

        },

        error: (error) => {

          console.error(

            'Error eliminando pedido:',

            error

          );

          alert(
            'Error al eliminar pedido'
          );

        }

      });

  }

  // 🧹 LIMPIAR FORMULARIO

  limpiarFormulario(): void {

    this.nuevoPedido = {

      cliente: '',

      productos: [],

      total: 0

    };

    this.limpiarSeleccionProducto();

  }

  // 🧹 LIMPIAR SELECTORES

  limpiarSeleccionProducto():
  void {

    this.productoSeleccionado =
      null;

    this.stockDisponible = 0;

    this.cantidadSeleccionada = 1;

  }

  // 🔄 TRACK BY

  trackByProductos(

    index: number,

    item: any

  ): number {

    return index;

  }

}