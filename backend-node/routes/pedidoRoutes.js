const express = require('express');

const router = express.Router();

const pedidoController = require(
  '../controllers/pedidoController'
);

const verificarToken =
require('../middlewares/authMiddleware');

const verificarRol =
require('../middlewares/roleMiddleware');

// 🔥 OBTENER TODOS LOS PEDIDOS

router.get(
  '/',
  verificarToken,
  verificarRol(
    'Administrador',
    'Gerente',
    'Contador'
  ),
  pedidoController.obtenerPedidos
);

// 🔥 OBTENER PEDIDO POR ID

router.get(
  '/:id',
  verificarToken,
  verificarRol(
    'Administrador',
    'Gerente',
    'Contador'
  ),
  pedidoController.obtenerPedidoPorId
);

// 🔥 CREAR PEDIDO

router.post(
  '/',
  verificarToken,
  verificarRol(
    'Administrador',
    'Gerente'
  ),
  pedidoController.crearPedido
);

// 🔥 ACTUALIZAR PEDIDO

router.put(
  '/:id',
  verificarToken,
  verificarRol(
    'Administrador',
    'Gerente'
  ),
  pedidoController.actualizarPedido
);

// 🔥 ELIMINAR PEDIDO

router.delete(
  '/:id',
  verificarToken,
  verificarRol(
    'Administrador'
  ),
  pedidoController.eliminarPedido
);

module.exports = router;