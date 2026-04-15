import { TestBed } from '@angular/core/testing';
import { EmpleadoService, Empleado } from './empleado.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('EmpleadoService', () => {
  let service: EmpleadoService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/empleados';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(EmpleadoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener la lista de empleados', () => {
    const mockEmpleados: Empleado[] = [
      { _id: '1', nombre: 'Juan', cargo: 'Dev', salario: 2000 },
      { _id: '2', nombre: 'Ana', cargo: 'QA', salario: 1800 }
    ];

    service.obtenerEmpleados().subscribe((res) => {
      expect(res.length).toBe(2);
      expect(res).toEqual(mockEmpleados);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockEmpleados);
  });

  it('debe crear un empleado', () => {
    const nuevoEmpleado: Empleado = {
      nombre: 'Carlos',
      cargo: 'Backend',
      salario: 2500
    };

    service.crearEmpleado(nuevoEmpleado).subscribe((res) => {
      expect(res).toEqual({ _id: '3', ...nuevoEmpleado });
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ _id: '3', ...nuevoEmpleado });
  });

  it('debe actualizar un empleado', () => {
    const empleadoActualizado: Empleado = {
      nombre: 'Luis',
      cargo: 'Fullstack',
      salario: 3000
    };

    service.actualizarEmpleado('1', empleadoActualizado).subscribe((res) => {
      expect(res).toEqual(empleadoActualizado);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(empleadoActualizado);
  });

  it('debe eliminar un empleado', () => {
    service.eliminarEmpleado('1').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ mensaje: 'Eliminado' });
  });
});