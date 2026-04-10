const express = require('express');
const router = express.Router();

const empleadoController = require('../controllers/empleadoController');

// 🔹 Crear empleado
router.post('/', empleadoController.crearEmpleado);

// 🔹 Obtener todos los empleados
router.get('/', empleadoController.obtenerEmpleados);

// 🔹 Obtener por ID
router.get('/:id', empleadoController.obtenerEmpleadoPorId);

// 🔹 Actualizar
router.put('/:id', empleadoController.actualizarEmpleado);

// 🔹 Eliminar
router.delete('/:id', empleadoController.eliminarEmpleado);

module.exports = router;