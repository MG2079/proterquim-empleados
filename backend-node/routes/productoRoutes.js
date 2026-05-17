const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const verificarRol =
require('../middlewares/roleMiddleware');

const productoController = require(
  '../controllers/productoController'
);

// 🔥 OBTENER TODOS LOS PRODUCTOS

router.get(
  '/',
  verificarToken,
  productoController.obtenerProductos
);

// 🔥 OBTENER PRODUCTO POR ID

router.get(
  '/:id',
  verificarToken,
  productoController.obtenerProductoPorId
);

// 🔥 CREAR PRODUCTO

router.post(
  '/',
  verificarToken,
  verificarRol(
    'Administrador',
    'Gerente'
  ),
  productoController.crearProducto
);

// 🔥 ACTUALIZAR PRODUCTO

router.put(
  '/:id',
  verificarToken,
  verificarRol(
    'Administrador',
    'Gerente'
  ),
  productoController.actualizarProducto
);

// 🔥 ELIMINAR PRODUCTO

router.delete(
  '/:id',
  verificarToken,
  verificarRol(
    'Administrador'
  ),
  productoController.eliminarProducto
);

module.exports = router;