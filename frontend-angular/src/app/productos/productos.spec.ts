import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductosComponent } from './productos';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProductosComponent', () => {
  let component: ProductosComponent;
  let fixture: ComponentFixture<ProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductosComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // 🔥 PRUEBA 5: Validación de datos inválidos

 it('debe crear un producto correctamente sin mostrar errores', () => {

  component.nuevoProducto = {
    nombre: 'Teclado',
    precio: 100,
    descripcion: 'Teclado mecánico',
    stock: 5
  };

  component.crearProducto();

  // 🔥 Validamos que no haya error
  expect(component.mensaje).toBeFalsy();
});

});