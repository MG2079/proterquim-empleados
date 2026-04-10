# Sistema de Gestión de Empleados - Proterquim

##  Descripción

Aplicación web desarrollada para la gestión de empleados de la empresa **Proterquim**, permitiendo realizar operaciones CRUD (Crear, Listar, Actualizar y Eliminar) de manera eficiente.

El sistema fue construido utilizando tecnologías modernas de desarrollo web, separando frontend y backend bajo una arquitectura por capas.

---

##  Tecnologías utilizadas

###  Frontend

* Angular
* TypeScript
* HTML5
* CSS3

###  Backend

* Node.js
* Express
* MongoDB
* Mongoose

---

##  Funcionalidades

* ➕ Crear empleados
* 📋 Listar empleados
* ✏️ Editar empleados
* ❌ Eliminar empleados
* 🔍 Filtrar empleados
* 💬 Mensajes de validación y confirmación

---

##  Arquitectura

El sistema está estructurado en tres capas:

* **Frontend:** Interfaz de usuario (Angular)
* **Backend:** API REST (Node.js + Express)
* **Base de datos:** MongoDB

---

## ▶ Ejecución del proyecto

###  Backend

```bash
cd backend-node
npm install
npm start
```

Servidor en:

```
http://localhost:3000
```

---

###  Frontend

```bash
cd frontend-angular
npm install
ng serve
```

Aplicación en:

```
http://localhost:4200
```

---

##  Endpoints API

* GET `/api/empleados`
* POST `/api/empleados`
* PUT `/api/empleados/:id`
* DELETE `/api/empleados/:id`

---

##  Pruebas realizadas

Se validaron las operaciones CRUD mediante:

* Navegador (Frontend Angular)
* API REST en navegador
* Base de datos MongoDB

---

##  Autor

Mario Gallo
Análisis y Desarrollo de Software

---

##  Licencia

Proyecto académico - SENA
