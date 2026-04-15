import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadosComponent } from './empleados';
import { EmpleadoService } from '../services/empleado.service';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

describe('EmpleadosComponent', () => {
  let component: EmpleadosComponent;
  let fixture: ComponentFixture<EmpleadosComponent>;

  const mockEmpleadoService = {
    obtenerEmpleados: jasmine.createSpy().and.returnValue(of([])),
    crearEmpleado: jasmine.createSpy().and.returnValue(of({})),
    actualizarEmpleado: jasmine.createSpy().and.returnValue(of({})),
    eliminarEmpleado: jasmine.createSpy().and.returnValue(of({}))
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  const mockActivatedRoute = {}; // 🔥 SOLUCIÓN

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadosComponent],
      providers: [
        { provide: EmpleadoService, useValue: mockEmpleadoService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute } // 🔥 CLAVE
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe llamar obtenerEmpleados al iniciar', () => {
    expect(mockEmpleadoService.obtenerEmpleados).toHaveBeenCalled();
  });

  it('debe filtrar empleados correctamente', () => {
    component.empleados = [
      { nombre: 'Juan', cargo: 'Dev', salario: 2000 },
      { nombre: 'Ana', cargo: 'QA', salario: 1800 }
    ];

    component.filtro = 'juan';
    component.actualizarLista();

    expect(component.empleadosFiltrados.length).toBe(1);
  });

  it('no debe crear empleado si faltan datos', () => {
    component.nuevoEmpleado = { nombre: '', cargo: '', salario: 0 };

    component.crearEmpleado();

    expect(component.mensaje).toContain('Todos los campos');
  });

  it('debe hacer logout correctamente', () => {
    spyOn(localStorage, 'removeItem');

    component.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('auth');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debe cargar empleados al iniciar (integración)', () => {
  // 🔥 Cambiamos el mock SOLO para esta prueba
  mockEmpleadoService.obtenerEmpleados.and.returnValue(
    of([
      { nombre: 'Juan', cargo: 'Dev', salario: 2000 },
      { nombre: 'Ana', cargo: 'QA', salario: 1800 }
    ])
  );

  // 🔥 Volvemos a ejecutar ngOnInit
  component.ngOnInit();

  expect(mockEmpleadoService.obtenerEmpleados).toHaveBeenCalled();
  expect(component.empleados.length).toBe(2);
});

});