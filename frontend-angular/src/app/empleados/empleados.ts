import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EmpleadoService, Empleado } from '../services/empleado.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './empleados.html',
  styleUrls: ['./empleados.css']
})
export class EmpleadosComponent implements OnInit {

  constructor(
    private router: Router,
    private empleadoService: EmpleadoService
  ) {}

  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];

  nuevoEmpleado: Empleado = {
    nombre: '',
    cargo: '',
    salario: 0
  };

  empleadoEditando: Empleado | null = null;

  mensaje: string = '';
  tipoMensaje: string = '';

  filtro: string = '';

  ngOnInit(): void {
    this.obtenerEmpleados();
  }

  // 🔥 OBTENER
  obtenerEmpleados() {
    this.empleadoService.obtenerEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
        this.actualizarLista();
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al cargar empleados', 'error');
      }
    });
  }

  // 🔍 FILTRO (OPTIMIZADO)
  actualizarLista() {
    const texto = this.filtro.toLowerCase().trim();

    this.empleadosFiltrados = this.empleados.filter(emp =>
      emp.nombre.toLowerCase().includes(texto) ||
      emp.cargo.toLowerCase().includes(texto)
    );
  }

  // ➕ CREAR
  crearEmpleado() {
    if (!this.nuevoEmpleado.nombre || !this.nuevoEmpleado.cargo || this.nuevoEmpleado.salario <= 0) {
      this.mostrarMensaje('Todos los campos son obligatorios', 'error');
      return;
    }

    this.empleadoService.crearEmpleado(this.nuevoEmpleado).subscribe({
      next: () => {
        this.obtenerEmpleados();
        this.limpiarFormulario();
        this.mostrarMensaje('Empleado agregado correctamente', 'exito');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al crear empleado', 'error');
      }
    });
  }

  // ✏️ EDITAR
  editarEmpleado(emp: Empleado) {
    this.empleadoEditando = { ...emp };
  }

  // 🔄 ACTUALIZAR
  actualizarEmpleado() {
    if (!this.empleadoEditando || !this.empleadoEditando._id) return;

    this.empleadoService.actualizarEmpleado(
      this.empleadoEditando._id,
      this.empleadoEditando
    ).subscribe({
      next: () => {
        this.obtenerEmpleados();
        this.empleadoEditando = null;
        this.mostrarMensaje('Empleado actualizado', 'exito');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al actualizar', 'error');
      }
    });
  }

  // 🗑️ ELIMINAR
  eliminarEmpleado(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este empleado?')) return;

    this.empleadoService.eliminarEmpleado(id).subscribe({
      next: () => {
        this.obtenerEmpleados();
        this.mostrarMensaje('Empleado eliminado', 'exito');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al eliminar', 'error');
      }
    });
  }

  cancelarEdicion() {
    this.empleadoEditando = null;
  }

  limpiarFormulario() {
    this.nuevoEmpleado = { nombre: '', cargo: '', salario: 0 };
  }

  // 🔔 MENSAJES
  mostrarMensaje(texto: string, tipo: string) {
    this.mensaje = texto;
    this.tipoMensaje = tipo === 'error' ? 'error' : 'success';

    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  // 🔐 LOGOUT (SOLO BOTÓN ABAJO)
  logout() {
    localStorage.removeItem('auth');
    this.router.navigate(['/']);
  }

}