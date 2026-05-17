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

export class EmpleadosComponent
implements OnInit {

  // 👨‍💼 LISTAS

  empleados: Empleado[] = [];

  empleadosFiltrados:
  Empleado[] = [];

  // ➕ NUEVO EMPLEADO

  nuevoEmpleado: Empleado = {

    nombre: '',

    cargo: '',

    salario: 0

  };

  // ✏️ EDICIÓN

  empleadoEditando:
  Empleado | null = null;

  // 🔔 MENSAJES

  mensaje = '';

  tipoMensaje = '';

  // 🔍 FILTRO

  filtro = '';

  // 🔄 LOADING

  cargando = false;

  constructor(

    private router: Router,

    private empleadoService:
    EmpleadoService,

    private searchService:
    SearchService

  ) {}

  // 🚀 INIT

  ngOnInit(): void {

    this.obtenerEmpleados();

    // 🔍 BUSCADOR GLOBAL

    this.searchService

      .termino$

      .subscribe({

        next: (
          texto: string
        ) => {

          this.filtro =
            texto;

          this.actualizarLista();

        }

      });

  }

  // 👨‍💼 OBTENER EMPLEADOS

  obtenerEmpleados(): void {

    this.cargando = true;

    this.empleadoService

      .obtenerEmpleados()

      .subscribe({

        next: (
          empleados: Empleado[]
        ) => {

          // 🔥 ORDENAR

          this.empleados =

            empleados.sort(

              (a, b) =>

                a.nombre.localeCompare(
                  b.nombre
                )

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

  // 🔍 FILTRAR EMPLEADOS

  actualizarLista(): void {

    const texto =

      this.filtro
        .toLowerCase()
        .trim();

    if (!texto) {

      this.empleadosFiltrados =

        [...this.empleados];

      return;

    }

    this.empleadosFiltrados =

      this.empleados.filter(

        (empleado) =>

          empleado.nombre
            .toLowerCase()
            .includes(texto)

          ||

          empleado.cargo
            .toLowerCase()
            .includes(texto)

      );

  }

  // ➕ CREAR EMPLEADO

  crearEmpleado(): void {

    // 🔥 VALIDACIONES

    if (

      !this.nuevoEmpleado.nombre
        .trim()

      ||

      !this.nuevoEmpleado.cargo
        .trim()

      ||

      this.nuevoEmpleado.salario <= 0

    ) {

      this.mostrarMensaje(

        'Todos los campos son obligatorios',

        'error'

      );

      return;

    }

    this.empleadoService

      .crearEmpleado(
        this.nuevoEmpleado
      )

      .subscribe({

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

          this.mostrarMensaje(

            'Error al crear empleado',

            'error'

          );

        }

      });

  }

  // ✏️ EDITAR EMPLEADO

  editarEmpleado(
    empleado: Empleado
  ): void {

    this.empleadoEditando = {

      ...empleado

    };

    // 🔥 SCROLL ARRIBA

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  }

  // 🔄 ACTUALIZAR EMPLEADO

  actualizarEmpleado(): void {

    if (

      !this.empleadoEditando ||

      !this.empleadoEditando._id

    ) {

      return;

    }

    // 🔥 VALIDACIONES

    if (

      !this.empleadoEditando.nombre
        .trim()

      ||

      !this.empleadoEditando.cargo
        .trim()

      ||

      this.empleadoEditando.salario <= 0

    ) {

      this.mostrarMensaje(

        'Todos los campos son obligatorios',

        'error'

      );

      return;

    }

    this.empleadoService

      .actualizarEmpleado(

        this.empleadoEditando._id,

        this.empleadoEditando

      )

      .subscribe({

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

          this.mostrarMensaje(

            'Error al actualizar empleado',

            'error'

          );

        }

      });

  }

  // 🗑 ELIMINAR EMPLEADO

  eliminarEmpleado(
    id: string
  ): void {

    const confirmar = confirm(

      '¿Seguro que deseas eliminar este empleado?'

    );

    if (!confirmar) {

      return;

    }

    this.empleadoService

      .eliminarEmpleado(id)

      .subscribe({

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

  // ❌ CANCELAR EDICIÓN

  cancelarEdicion(): void {

    this.empleadoEditando =
      null;

  }

  // 🧹 LIMPIAR FORMULARIO

  limpiarFormulario(): void {

    this.nuevoEmpleado = {

      nombre: '',

      cargo: '',

      salario: 0

    };

  }

  // 🔔 MOSTRAR MENSAJES

  mostrarMensaje(

    texto: string,

    tipo: string

  ): void {

    this.mensaje = texto;

    this.tipoMensaje =

      tipo === 'error'

        ? 'error'

        : 'success';

    setTimeout(() => {

      this.mensaje = '';

    }, 4000);

  }

  // 🚀 NAVEGACIÓN

  irAProductos(): void {

    this.router.navigate([
      '/productos'
    ]);

  }

  irADashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

}