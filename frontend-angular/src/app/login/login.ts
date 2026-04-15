import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  usuario: string = '';
  password: string = '';

  mensajeError: string = '';
  tipoMensaje: string = ''; // 🔥 NUEVO (exito / error)
  cargando: boolean = false;
  verPassword: boolean = false;

  constructor(private router: Router) {}

  // 🔥 SE EJECUTA AL ENTRAR AL LOGIN
  ngOnInit() {
  const mensaje = localStorage.getItem('mensajeLogout');

  if (mensaje) {
    this.mensajeError = mensaje;
    this.tipoMensaje = 'exito';

    setTimeout(() => {
      this.mensajeError = '';
      this.tipoMensaje = '';
    }, 3000);

    localStorage.removeItem('mensajeLogout');

  } else if (localStorage.getItem('auth') === 'true') {
    this.router.navigate(['/productos']);
  }
}

  login() {

    if (!this.usuario || !this.password) {
      this.mensajeError = 'Todos los campos son obligatorios';
      this.tipoMensaje = 'error';
      return;
    }

    this.mensajeError = '';
    this.tipoMensaje = '';
    this.cargando = true;

    fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.usuario,
        password: this.password
      })
    })
    .then(res => res.json())
    .then(data => {

      if (data.usuario) {
        localStorage.setItem('auth', 'true');
        this.router.navigate(['/productos']);
      } else {
        this.mensajeError = 'Usuario o contraseña incorrectos';
        this.tipoMensaje = 'error';
        this.password = '';
      }

      this.cargando = false;
    })
    .catch(() => {
      this.mensajeError = 'Error de conexión con el servidor';
      this.tipoMensaje = 'error';
      this.cargando = false;
    });
  }

  togglePassword() {
    this.verPassword = !this.verPassword;
  }

  recuperar() {
    this.mensajeError = 'Funcionalidad en desarrollo';
    this.tipoMensaje = 'error';
  }
}