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
  Router,
  RouterModule
} from '@angular/router';

import {
  EmpleadoService,
  Empleado
} from '../services/empleado.service';

import {
  SearchService
} from '../services/search.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './empleados.html',
  styleUrls: ['./empleados.css']
})
export class EmpleadosComponent implements OnInit {

  // LISTAS
  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];

  // NUEVO EMPLEADO
  nuevoEmpleado: Empleado = {
    nombre: '',
    cargo: '',
    salario: 0
  };

  // EDICIÓN
  empleadoEditando: Empleado | null = null;

  // MENSAJES
  mensaje = '';
  tipoMensaje = '';

  // FILTRO
  filtro = '';

  // CARGA
  cargando = false;

  constructor(
    private router: Router,
    private empleadoService: EmpleadoService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.obtenerEmpleados();

    // Buscador global
    this.searchService.termino$.subscribe({
      next: (texto: string) => {
        this.filtro = texto;
        this.actualizarLista();
      }
    });
  }

  // OBTENER EMPLEADOS
  obtenerEmpleados(): void {
    this.cargando = true;

    this.empleadoService.obtenerEmpleados().subscribe({
      next: (empleados: Empleado[]) => {
        this.empleados = empleados.sort(
          (a, b) => a.nombre.localeCompare(b.nombre)
        );

        this.actualizarLista();
        this.cargando = false;
      },
      error: (error) => {
        console.error(error);
        this.mostrarMensaje(
          'Error al cargar empleados',
          'error'
        );
        this.cargando = false;
      }
    });
  }

  // FILTRAR EMPLEADOS
  actualizarLista(): void {
    const texto = this.filtro.toLowerCase().trim();

    if (!texto) {
      this.empleadosFiltrados = [...this.empleados];
      return;
    }

    this.empleadosFiltrados = this.empleados.filter(
      (empleado) =>
        empleado.nombre.toLowerCase().includes(texto) ||
        empleado.cargo.toLowerCase().includes(texto)
    );
  }

  // VALIDAR SALARIO
  private validarSalario(salario: unknown): string | null {
    if (
      salario === null ||
      salario === undefined ||
      (typeof salario === 'string' && salario.trim() === '')
    ) {
      return 'El salario es obligatorio';
    }

    const valor = Number(salario);

    if (!Number.isFinite(valor)) {
      return 'El salario debe ser un número válido';
    }

    if (valor < 0) {
      return 'El salario no puede ser negativo';
    }

    if (valor === 0) {
      return 'El salario debe ser mayor que cero';
    }

    return null;
  }

  // VALIDAR NOMBRE Y CARGO
  private validarDatosEmpleado(
    empleado: Empleado
  ): string | null {
    if (
      typeof empleado.nombre !== 'string' ||
      !empleado.nombre.trim()
    ) {
      return 'El nombre del empleado es obligatorio';
    }

    if (empleado.nombre.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }

    if (empleado.nombre.trim().length > 100) {
      return 'El nombre no puede superar los 100 caracteres';
    }

    if (
      typeof empleado.cargo !== 'string' ||
      !empleado.cargo.trim()
    ) {
      return 'El cargo del empleado es obligatorio';
    }

    if (empleado.cargo.trim().length < 2) {
      return 'El cargo debe tener al menos 2 caracteres';
    }

    if (empleado.cargo.trim().length > 100) {
      return 'El cargo no puede superar los 100 caracteres';
    }

    return this.validarSalario(empleado.salario);
  }

  // CREAR EMPLEADO
  crearEmpleado(): void {
    const errorValidacion = this.validarDatosEmpleado(
      this.nuevoEmpleado
    );

    if (errorValidacion) {
      this.mostrarMensaje(errorValidacion, 'error');
      return;
    }

    const datosEmpleado: Empleado = {
      ...this.nuevoEmpleado,
      nombre: this.nuevoEmpleado.nombre.trim(),
      cargo: this.nuevoEmpleado.cargo.trim(),
      salario: Number(this.nuevoEmpleado.salario)
    };

    this.empleadoService.crearEmpleado(datosEmpleado).subscribe({
      next: () => {
        this.obtenerEmpleados();
        this.limpiarFormulario();

        this.mostrarMensaje(
          'Empleado agregado correctamente',
          'success'
        );
      },
      error: (error) => {
        console.error(error);

        const mensajeServidor =
          error?.error?.errores?.[0] ||
          error?.error?.mensaje ||
          'Error al crear empleado';

        this.mostrarMensaje(mensajeServidor, 'error');
      }
    });
  }

  // EDITAR EMPLEADO
  editarEmpleado(empleado: Empleado): void {
    this.empleadoEditando = { ...empleado };

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ACTUALIZAR EMPLEADO
  actualizarEmpleado(): void {
    if (
      !this.empleadoEditando ||
      !this.empleadoEditando._id
    ) {
      return;
    }

    const errorValidacion = this.validarDatosEmpleado(
      this.empleadoEditando
    );

    if (errorValidacion) {
      this.mostrarMensaje(errorValidacion, 'error');
      return;
    }

    const datosEmpleado: Empleado = {
      ...this.empleadoEditando,
      nombre: this.empleadoEditando.nombre.trim(),
      cargo: this.empleadoEditando.cargo.trim(),
      salario: Number(this.empleadoEditando.salario)
    };

    this.empleadoService.actualizarEmpleado(
      this.empleadoEditando._id,
      datosEmpleado
    ).subscribe({
      next: () => {
        this.obtenerEmpleados();
        this.cancelarEdicion();

        this.mostrarMensaje(
          'Empleado actualizado correctamente',
          'success'
        );
      },
      error: (error) => {
        console.error(error);

        const mensajeServidor =
          error?.error?.errores?.[0] ||
          error?.error?.mensaje ||
          'Error al actualizar empleado';

        this.mostrarMensaje(mensajeServidor, 'error');
      }
    });
  }

  // ELIMINAR EMPLEADO
  eliminarEmpleado(id: string): void {
    const confirmar = confirm(
      '¿Seguro que deseas eliminar este empleado?'
    );

    if (!confirmar) {
      return;
    }

    this.empleadoService.eliminarEmpleado(id).subscribe({
      next: () => {
        this.obtenerEmpleados();

        this.mostrarMensaje(
          'Empleado eliminado correctamente',
          'success'
        );
      },
      error: (error) => {
        console.error(error);

        this.mostrarMensaje(
          'Error al eliminar empleado',
          'error'
        );
      }
    });
  }

  // CANCELAR EDICIÓN
  cancelarEdicion(): void {
    this.empleadoEditando = null;
  }

  // LIMPIAR FORMULARIO
  limpiarFormulario(): void {
    this.nuevoEmpleado = {
      nombre: '',
      cargo: '',
      salario: 0
    };
  }

  // MOSTRAR MENSAJES
  mostrarMensaje(
    texto: string,
    tipo: string
  ): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo === 'error' ? 'error' : 'success';

    setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }

  // NAVEGACIÓN
  irAProductos(): void {
    this.router.navigate(['/productos']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
