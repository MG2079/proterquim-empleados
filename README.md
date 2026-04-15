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


## 🧪 Pruebas realizadas

En el proyecto Proterquim se implementaron diferentes tipos de pruebas para garantizar la calidad del software:

- ✔ Pruebas unitarias con Karma y Jasmine
- ✔ Pruebas de integración entre componentes
- ✔ Pruebas funcionales de validación de datos
- ✔ Pruebas de rendimiento utilizando herramientas del navegador (DevTools)

Estas pruebas permitieron verificar el correcto funcionamiento del sistema, detectar errores y asegurar el cumplimiento de los requerimientos.

---

##  Autor

Mario Gallo
Análisis y Desarrollo de Software

---

##  Licencia

Proyecto académico - SENA
