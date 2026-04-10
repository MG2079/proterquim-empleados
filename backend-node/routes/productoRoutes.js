const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.obtenerProductos);
router.post('/', productoController.crearProducto);
router.delete('/:id', productoController.eliminarProducto);
router.put('/:id', productoController.actualizarProducto);

module.exports = router;