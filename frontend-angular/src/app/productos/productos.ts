import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import {
  ProductoService,
  Producto,
  RespuestaProducto
} from '../services/producto.service';

import { SearchService } from '../services/search.service';

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
export class ProductosComponent implements OnInit, OnDestroy {

  // ==========================================
  // LISTADOS
  // ==========================================

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  // ==========================================
  // FORMULARIO DE CREACIÓN
  // ==========================================

  nuevoProducto: Producto = this.crearFormularioVacio();

  // ==========================================
  // FORMULARIO DE EDICIÓN
  // ==========================================

  productoEditando: Producto | null = null;

  // ==========================================
  // MENSAJES Y CARGA
  // ==========================================

  mensaje = '';
  tipoMensaje = '';
  cargando = false;

  private searchSubscription?: Subscription;
  private temporizadorMensaje?: ReturnType<typeof setTimeout>;

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private searchService: SearchService
  ) {}

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {
    this.obtenerProductos();

    this.searchSubscription = this.searchService.termino$.subscribe({
      next: (texto: string) => {
        this.filtrarProductos(texto);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();

    if (this.temporizadorMensaje) {
      clearTimeout(this.temporizadorMensaje);
    }
  }

  // ==========================================
  // FORMULARIO VACÍO
  // ==========================================

  private crearFormularioVacio(): Producto {
    return {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      stockMinimo: 20,
      categoria: 'General',
      estado: 'Crítico',
      activo: true
    };
  }

  // ==========================================
  // OBTENER PRODUCTOS
  // ==========================================

  obtenerProductos(): void {
    this.cargando = true;

    this.productoService.obtenerProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productos = productos;

        // Aplicar el término de búsqueda actual.
        this.filtrarProductos(this.ultimoTerminoBusqueda);

        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error cargando productos:', error);

        this.mostrarMensaje(
          this.obtenerMensajeError(
            error,
            'Error al cargar productos'
          ),
          'error'
        );

        this.cargando = false;
      }
    });
  }

  // ==========================================
  // FILTRAR PRODUCTOS
  // ==========================================

  private ultimoTerminoBusqueda = '';

  filtrarProductos(texto: string): void {
    this.ultimoTerminoBusqueda = texto || '';

    const valor = this.ultimoTerminoBusqueda
      .trim()
      .toLowerCase();

    if (!valor) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productosFiltrados = this.productos.filter(
      (producto: Producto) =>
        producto.nombre.toLowerCase().includes(valor) ||
        producto.descripcion.toLowerCase().includes(valor) ||
        (producto.categoria || '').toLowerCase().includes(valor) ||
        (producto.estado || '').toLowerCase().includes(valor)
    );
  }

  // ==========================================
  // CREAR PRODUCTO
  // ==========================================

  crearProducto(): void {
    if (!this.validarProducto(this.nuevoProducto)) {
      return;
    }

    this.cargando = true;

    this.productoService.crearProducto(this.nuevoProducto).subscribe({
      next: (respuesta: RespuestaProducto) => {
        this.mostrarMensaje(
          respuesta.mensaje || 'Producto agregado correctamente',
          'success'
        );

        this.limpiarFormulario();
        this.obtenerProductos();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creando producto:', error);

        this.mostrarMensaje(
          this.obtenerMensajeError(error, 'Error al crear producto'),
          'error'
        );

        this.cargando = false;
      }
    });
  }

  // ==========================================
  // EDITAR PRODUCTO
  // ==========================================

  editarProducto(producto: Producto): void {
    this.productoEditando = { ...producto };
  }

  // ==========================================
  // ACTUALIZAR PRODUCTO
  // ==========================================

  actualizarProducto(): void {
    if (!this.productoEditando?._id) {
      this.mostrarMensaje(
        'No se pudo identificar el producto',
        'error'
      );
      return;
    }

    if (!this.validarProducto(this.productoEditando)) {
      return;
    }

    this.cargando = true;

    this.productoService.actualizarProducto(
      this.productoEditando._id,
      this.productoEditando
    ).subscribe({
      next: (respuesta: RespuestaProducto) => {
        this.mostrarMensaje(
          respuesta.mensaje || 'Producto actualizado correctamente',
          'success'
        );

        this.cancelarEdicion();
        this.obtenerProductos();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error actualizando producto:', error);

        this.mostrarMensaje(
          this.obtenerMensajeError(
            error,
            'Error al actualizar producto'
          ),
          'error'
        );

        this.cargando = false;
      }
    });
  }

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================

  eliminarProducto(id: string): void {
    const confirmar = confirm(
      '¿Desea eliminar este producto? Esta acción no se puede deshacer.'
    );

    if (!confirmar) {
      return;
    }

    this.cargando = true;

    this.productoService.eliminarProducto(id).subscribe({
      next: (respuesta: { mensaje: string }) => {
        this.mostrarMensaje(
          respuesta.mensaje || 'Producto eliminado correctamente',
          'success'
        );

        this.obtenerProductos();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error eliminando producto:', error);

        this.mostrarMensaje(
          this.obtenerMensajeError(
            error,
            'Error al eliminar producto'
          ),
          'error'
        );

        this.cargando = false;
      }
    });
  }

  // ==========================================
  // VALIDAR PRODUCTO
  // ==========================================

  validarProducto(producto: Producto): boolean {
    if (
      typeof producto.nombre !== 'string' ||
      !producto.nombre.trim() ||
      typeof producto.descripcion !== 'string' ||
      !producto.descripcion.trim()
    ) {
      this.mostrarMensaje(
        'El nombre y la descripción son obligatorios',
        'error'
      );
      return false;
    }

    if (
      typeof producto.precio !== 'number' ||
      !Number.isFinite(producto.precio) ||
      producto.precio <= 0
    ) {
      this.mostrarMensaje(
        'El precio debe ser un número válido mayor que cero',
        'error'
      );
      return false;
    }

    if (
      typeof producto.stock !== 'number' ||
      !Number.isSafeInteger(producto.stock) ||
      producto.stock < 0
    ) {
      this.mostrarMensaje(
        'El stock debe ser un número entero no negativo',
        'error'
      );
      return false;
    }

    if (
      typeof producto.stockMinimo !== 'number' ||
      !Number.isSafeInteger(producto.stockMinimo) ||
      producto.stockMinimo < 0
    ) {
      this.mostrarMensaje(
        'El stock mínimo debe ser un número entero no negativo',
        'error'
      );
      return false;
    }

    return true;
  }

  // ==========================================
  // CANCELAR EDICIÓN
  // ==========================================

  cancelarEdicion(): void {
    this.productoEditando = null;
  }

  // ==========================================
  // LIMPIAR FORMULARIO
  // ==========================================

  limpiarFormulario(): void {
    this.nuevoProducto = this.crearFormularioVacio();
  }

  // ==========================================
  // OBTENER MENSAJE DE ERROR
  // ==========================================

  private obtenerMensajeError(
    error: HttpErrorResponse,
    mensajePredeterminado: string
  ): string {
    const mensajeServidor = error.error?.mensaje;

    return typeof mensajeServidor === 'string' && mensajeServidor.trim()
      ? mensajeServidor
      : mensajePredeterminado;
  }

  // ==========================================
  // MOSTRAR MENSAJES
  // ==========================================

  mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;

    if (this.temporizadorMensaje) {
      clearTimeout(this.temporizadorMensaje);
    }

    this.temporizadorMensaje = setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
      this.temporizadorMensaje = undefined;
    }, 4000);
  }

  // ==========================================
  // NAVEGACIÓN
  // ==========================================

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  irAEmpleados(): void {
    this.router.navigate(['/empleados']);
  }
}
