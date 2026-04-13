const Producto = require('../models/Producto');

// 📥 LISTAR PRODUCTOS
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
};

// ➕ CREAR PRODUCTO
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;

    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({
        mensaje: 'Nombre, precio y stock son obligatorios'
      });
    }

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      stock
    });

    const productoGuardado = await nuevoProducto.save();

    res.status(201).json(productoGuardado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
};

// 🗑 ELIMINAR PRODUCTO
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Producto eliminado correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
};

// ✏️ ACTUALIZAR PRODUCTO
exports.actualizarProducto = async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // 🔥 devuelve el actualizado
    );

    if (!productoActualizado) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.status(200).json(productoActualizado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
};