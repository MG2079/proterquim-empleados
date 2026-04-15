import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { Router } from '@angular/router';

describe('Login - Integración', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        json: () => Promise.resolve({ usuario: 'admin' })
      }) as any
    );

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  it('debe hacer login correctamente y redirigir', async () => {
  component.usuario = 'admin';
  component.password = '123456';

  component.login();

  // 🔥 Esperar a que se resuelva el fetch
  await new Promise(resolve => setTimeout(resolve, 0));

  expect(localStorage.getItem('auth')).toBe('true');
  expect(mockRouter.navigate).toHaveBeenCalledWith(['/productos']);
});
});