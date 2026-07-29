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
  Router
} from '@angular/router';

import {

  ProductoService,

  Producto

} from '../services/producto.service';

import {
  SearchService
} from '../services/search.service';

@Component({

  selector: 'app-productos',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './productos.html',

  styleUrls: ['./productos.css']

})

export class ProductosComponent
implements OnInit {

  // 📦 LISTADOS

  productos: Producto[] = [];

  productosFiltrados:
  Producto[] = [];

  // ➕ NUEVO PRODUCTO

  nuevoProducto: Producto = {

    nombre: '',

    descripcion: '',

    precio: 0,

    stock: 0,

    stockMinimo: 20,

    categoria: 'General',

    estado: 'Normal'

  };

  // ✏️ EDITAR PRODUCTO

  productoEditando:
  Producto | null = null;

  // 🔔 MENSAJES

  mensaje = '';

  tipoMensaje = '';

  // 🔄 LOADING

  cargando = false;

  constructor(

    private router: Router,

    private productoService:
    ProductoService,

    private searchService:
    SearchService

  ) {}

  ngOnInit(): void {

    this.obtenerProductos();

    // 🔍 BUSCADOR GLOBAL

    this.searchService
      .termino$

      .subscribe({

        next: (
          texto: string
        ) => {

          this.filtrarProductos(
            texto
          );

        }

      });

  }

  // 📦 OBTENER PRODUCTOS

  obtenerProductos(): void {

    this.cargando = true;

    this.productoService
      .obtenerProductos()

      .subscribe({

        next: (
          productos: Producto[]
        ) => {

          this.productos =
            productos;

          this.productosFiltrados =
            productos;

          this.cargando = false;

        },

        error: (error) => {

          console.error(

            'Error cargando productos:',

            error

          );

          this.mostrarMensaje(

            'Error al cargar productos',

            'error'

          );

          this.cargando = false;

        }

      });

  }

  // 🔍 FILTRAR PRODUCTOS

  filtrarProductos(
    texto: string
  ): void {

    if (!texto.trim()) {

      this.productosFiltrados =
        this.productos;

      return;

    }

    const valor =
      texto.toLowerCase();

    this.productosFiltrados =

      this.productos.filter(

        (producto) =>

          producto.nombre
            .toLowerCase()
            .includes(valor)

          ||

          producto.descripcion
            .toLowerCase()
            .includes(valor)

      );

  }

  // ➕ CREAR PRODUCTO

  crearProducto(): void {

    if (

      !this.validarProducto(
        this.nuevoProducto
      )

    ) {

      return;

    }

    this.cargando = true;

    this.productoService

      .crearProducto(
        this.nuevoProducto
      )

      .subscribe({

        next: () => {

          this.obtenerProductos();

          this.limpiarFormulario();

          this.mostrarMensaje(

            'Producto agregado correctamente',

            'success'

          );

          this.cargando = false;

        },

        error: (error) => {

          console.error(

            'Error creando producto:',

            error

          );

          this.mostrarMensaje(

            error.error?.mensaje ||

            'Error al crear producto',

            'error'

          );

          this.cargando = false;

        }

      });

  }

  // ✏️ EDITAR PRODUCTO

editarProducto(
  producto: Producto
): void {

  this.productoEditando = {

    ...producto

  };

}

  // 🔄 ACTUALIZAR PRODUCTO

  actualizarProducto(): void {

    if (

      !this.productoEditando ||

      !this.productoEditando._id

    ) {

      return;

    }

    if (

      !this.validarProducto(

        this.productoEditando

      )

    ) {

      return;

    }

    this.cargando = true;

    this.productoService

      .actualizarProducto(

        this.productoEditando._id,

        this.productoEditando

      )

      .subscribe({

        next: () => {

          this.obtenerProductos();

          this.cancelarEdicion();

          this.mostrarMensaje(

            'Producto actualizado correctamente',

            'success'

          );

          this.cargando = false;

        },

        error: (error) => {

          console.error(

            'Error actualizando producto:',

            error

          );

          this.mostrarMensaje(

            error.error?.mensaje ||

            'Error al actualizar producto',

            'error'

          );

          this.cargando = false;

        }

      });

  }

  // 🗑 ELIMINAR PRODUCTO

  eliminarProducto(
    id: string
  ): void {

    const confirmar = confirm(

      '¿Desea eliminar este producto?'

    );

    if (!confirmar) {

      return;

    }

    this.productoService

      .eliminarProducto(id)

      .subscribe({

        next: () => {

          this.obtenerProductos();

          this.mostrarMensaje(

            'Producto eliminado correctamente',

            'success'

          );

        },

        error: (error) => {

          console.error(

            'Error eliminando producto:',

            error

          );

          this.mostrarMensaje(

            'Error al eliminar producto',

            'error'

          );

        }

      });

  }

  // ✅ VALIDAR PRODUCTO

  validarProducto(
    producto: Producto
  ): boolean {

    // 🔥 CAMPOS VACÍOS

    if (

      !producto.nombre.trim() ||

      !producto.descripcion.trim()

    ) {

      this.mostrarMensaje(

        'Todos los campos son obligatorios',

        'error'

      );

      return false;

    }

    // 🔥 PRECIO NEGATIVO

    if (producto.precio < 0) {

      this.mostrarMensaje(

        'El precio no puede ser negativo',

        'error'

      );

      return false;

    }

    // 🔥 PRECIO EN CERO

    if (producto.precio === 0) {

      this.mostrarMensaje(

        'El precio debe ser mayor a cero',

        'error'

      );

      return false;

    }

    // 🔥 STOCK NEGATIVO

    if (producto.stock < 0) {

      this.mostrarMensaje(

        'El stock no puede ser negativo',

        'error'

      );

      return false;

    }

    return true;

  }

  // ❌ CANCELAR EDICIÓN

  cancelarEdicion(): void {

    this.productoEditando =
      null;

  }

  // 🧹 LIMPIAR FORMULARIO

  limpiarFormulario(): void {

    this.nuevoProducto = {

      nombre: '',

      descripcion: '',

      precio: 0,

      stock: 0,

      stockMinimo: 20,

      categoria: 'General',

      estado: 'Normal'

    };

  }

  // 🔔 MOSTRAR MENSAJES

  mostrarMensaje(

    texto: string,

    tipo: string

  ): void {

    this.mensaje = texto;

    this.tipoMensaje = tipo;

    setTimeout(() => {

      this.mensaje = '';

    }, 4000);

  }

  // 🚀 NAVEGACIÓN

  irADashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

  irAEmpleados(): void {

    this.router.navigate([
      '/empleados'
    ]);

  }

}