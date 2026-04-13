import { Component } from '@angular/core';
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
export class Login {

  usuario: string = '';
  password: string = '';

  mensajeError: string = '';
  cargando: boolean = false;
  verPassword: boolean = false;

  constructor(private router: Router) {
    if (localStorage.getItem('auth') === 'true') {
      this.router.navigate(['/productos']);
    }
  }

  login() {

    if (!this.usuario || !this.password) {
      this.mensajeError = 'Todos los campos son obligatorios';
      return;
    }

    this.mensajeError = '';
    this.cargando = true;

    fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.usuario,   // 🔥 IMPORTANTE: email
        password: this.password
      })
    })
    .then(res => res.json())
    .then(data => {

      if (data.usuario) {
  localStorage.setItem('auth', 'true');

  // 🔥 CAMBIO AQUÍ
  this.router.navigate(['/productos']);

} else {
  this.mensajeError = 'Usuario o contraseña incorrectos';
  this.password = '';
}

      this.cargando = false;
    })
    .catch(() => {
      this.mensajeError = 'Error de conexión con el servidor';
      this.cargando = false;
    });
  }

  togglePassword() {
    this.verPassword = !this.verPassword;
  }

  recuperar() {
    this.mensajeError = 'Funcionalidad en desarrollo';
  }
}