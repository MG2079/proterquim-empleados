import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService, Producto } from '../services/producto.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit, DoCheck {

  constructor(
    private router: Router,
    private productoService: ProductoService
  ) {}

  productos: Producto[] = [];
  productosFiltrados: Producto[] = []; // 🔥 CLAVE

  // 🔥 FORMULARIO CREAR
  nuevoProducto: Producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0
  };

  // ✏️ EDITAR
  productoEditando: Producto | null = null;

  mensaje: string = '';
  tipoMensaje: string = '';
  filtro: string = '';

  ngOnInit(): void {
    this.obtenerProductos();
  }

  // 🔥 OBTENER PRODUCTOS
  obtenerProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data; // 🔥 IMPORTANTE
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al cargar productos', 'error');
      }
    });
  }

  // 🔍 FILTRO EN TIEMPO REAL
  actualizarLista() {
    if (!this.filtro) {
      this.productosFiltrados = this.productos;
    } else {
      this.productosFiltrados = this.productos.filter(p =>
        p.nombre.toLowerCase().includes(this.filtro.toLowerCase())
      );
    }
  }

  ngDoCheck() {
    this.actualizarLista();
  }

  // ➕ CREAR PRODUCTO
  crearProducto() {
    if (
      !this.nuevoProducto.nombre ||
      !this.nuevoProducto.descripcion ||
      this.nuevoProducto.precio <= 0 ||
      this.nuevoProducto.stock < 0
    ) {
      this.mostrarMensaje('Todos los campos son obligatorios y válidos', 'error');
      return;
    }

    this.productoService.crearProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.obtenerProductos();
        this.limpiarFormulario();
        this.mostrarMensaje('Producto agregado correctamente', 'exito');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al crear producto', 'error');
      }
    });
  }

  // 🗑️ ELIMINAR
  eliminarProducto(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.obtenerProductos();
        this.mostrarMensaje('Producto eliminado correctamente', 'exito');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al eliminar producto', 'error');
      }
    });
  }

  // ✏️ ACTIVAR EDICIÓN
  editarProducto(p: Producto) {
    this.productoEditando = { ...p };
  }

  // 🔄 ACTUALIZAR PRODUCTO
  actualizarProducto() {
    if (!this.productoEditando || !this.productoEditando._id) return;

    this.productoService.actualizarProducto(
      this.productoEditando._id,
      this.productoEditando
    ).subscribe({
      next: () => {
        this.obtenerProductos();
        this.productoEditando = null;
        this.mostrarMensaje('Producto actualizado correctamente', 'exito');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al actualizar producto', 'error');
      }
    });
  }

  // ❌ CANCELAR EDICIÓN
  cancelarEdicion() {
    this.productoEditando = null;
  }

  // 🧹 LIMPIAR FORMULARIO
  limpiarFormulario() {
    this.nuevoProducto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0
    };
  }

  // 🔔 MENSAJES
  mostrarMensaje(texto: string, tipo: string) {
    this.mensaje = texto;
    this.tipoMensaje = tipo === 'error' ? 'error' : 'success';

    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  // 🔐 LOGOUT
  logout() {
  localStorage.setItem('mensajeLogout', 'Sesión cerrada correctamente');

  localStorage.removeItem('auth');

  this.router.navigate(['/login']);
}

  // 🔄 NAVEGACIÓN
  irAEmpleados() {
    this.router.navigate(['/empleados']);
  }
}