const express = require('express');

const router = express.Router();

const empleadoController = require(
  '../controllers/empleadoController'
);

const verificarToken =
require('../middlewares/authMiddleware');

const verificarRol =
require('../middlewares/roleMiddleware');

// 🔥 OBTENER EMPLEADOS

router.get(
  '/',
  verificarToken,
  verificarRol(
    'Administrador',
    'Gerente'
  ),
  empleadoController.obtenerEmpleados
);

// 🔥 OBTENER EMPLEADO POR ID

router.get(
  '/:id',
  verificarToken,
  verificarRol(
    'Administrador',
    'Gerente'
  ),
  empleadoController.obtenerEmpleadoPorId
);

// 🔥 CREAR EMPLEADO

router.post(
  '/',
  verificarToken,
  verificarRol(
    'Administrador'
  ),
  empleadoController.crearEmpleado
);

// 🔥 ACTUALIZAR EMPLEADO

router.put(
  '/:id',
  verificarToken,
  verificarRol(
    'Administrador'
  ),
  empleadoController.actualizarEmpleado
);

// 🔥 ELIMINAR EMPLEADO

router.delete(
  '/:id',
  verificarToken,
  verificarRol(
    'Administrador'
  ),
  empleadoController.eliminarEmpleado
);

module.exports = router;