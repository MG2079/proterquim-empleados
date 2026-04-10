const Producto = require('../models/Producto');

// LISTAR
exports.obtenerProductos = async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
};

// CREAR
exports.crearProducto = async (req, res) => {
  const nuevo = new Producto(req.body);
  await nuevo.save();
  res.json(nuevo);
};

// ELIMINAR
exports.eliminarProducto = async (req, res) => {
  await Producto.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Producto eliminado' });
};

// ACTUALIZAR
exports.actualizarProducto = async (req, res) => {
  await Producto.findByIdAndUpdate(req.params.id, req.body);
  res.json({ mensaje: 'Producto actualizado' });
};