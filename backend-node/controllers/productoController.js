
const mongoose = require('mongoose');
const Producto = require('../models/Producto');

// ==========================================
// VALIDACIONES Y RESPUESTAS DE ERROR
// ==========================================

const tiene = (objeto, campo) =>
  Object.prototype.hasOwnProperty.call(objeto, campo);

const validarTexto = (valor, campo) => {
  if (typeof valor !== 'string' || !valor.trim()) {
    return `${campo} es obligatorio y no puede estar vacío`;
  }

  return null;
};

const validarNumero = (valor, campo, opciones = {}) => {
  const { minimo = 0, entero = false } = opciones;

  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return `${campo} debe ser un número válido`;
  }

  if (valor < minimo) {
    return `${campo} no puede ser menor que ${minimo}`;
  }

  if (entero && !Number.isSafeInteger(valor)) {
    return `${campo} debe ser un número entero válido`;
  }

  return null;
};

const responderError = (res, error, operacion) => {
  console.error(`Error al ${operacion}:`, error);

  if (error.name === 'ValidationError') {
    const mensajes = Object.values(error.errors)
      .map(item => item.message);

    return res.status(400).json({
      mensaje: 'Los datos del producto no son válidos',
      errores: mensajes
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      mensaje: 'El identificador o alguno de los datos no es válido'
    });
  }

  return res.status(500).json({
    mensaje: `Error al ${operacion}`
  });
};

// ==========================================
// OBTENER TODOS LOS PRODUCTOS
// ==========================================

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find()
      .sort({ createdAt: -1 });

    return res.status(200).json(productos);
  } catch (error) {
    return responderError(res, error, 'obtener productos');
  }
};

// ==========================================
// OBTENER PRODUCTO POR ID
// ==========================================

exports.obtenerProductoPorId = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        mensaje: 'El identificador del producto no es válido'
      });
    }

    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    return res.status(200).json(producto);
  } catch (error) {
    return responderError(res, error, 'obtener producto');
  }
};

// ==========================================
// CREAR PRODUCTO
// ==========================================

exports.crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      stockMinimo
    } = req.body;

    const errorNombre = validarTexto(nombre, 'El nombre');
    if (errorNombre) {
      return res.status(400).json({ mensaje: errorNombre });
    }

    const errorDescripcion = validarTexto(
      descripcion,
      'La descripción'
    );
    if (errorDescripcion) {
      return res.status(400).json({ mensaje: errorDescripcion });
    }

    if (!tiene(req.body, 'precio')) {
      return res.status(400).json({
        mensaje: 'El precio es obligatorio'
      });
    }

    const errorPrecio = validarNumero(precio, 'El precio');
    if (errorPrecio) {
      return res.status(400).json({ mensaje: errorPrecio });
    }

    if (!tiene(req.body, 'stock')) {
      return res.status(400).json({
        mensaje: 'El stock es obligatorio'
      });
    }

    const errorStock = validarNumero(stock, 'El stock', {
      entero: true
    });
    if (errorStock) {
      return res.status(400).json({ mensaje: errorStock });
    }

    const minimo = stockMinimo === undefined ? 20 : stockMinimo;

    const errorMinimo = validarNumero(minimo, 'El stock mínimo', {
      entero: true
    });
    if (errorMinimo) {
      return res.status(400).json({ mensaje: errorMinimo });
    }

    if (
      categoria !== undefined &&
      (typeof categoria !== 'string' || !categoria.trim())
    ) {
      return res.status(400).json({
        mensaje: 'La categoría debe ser un texto no vacío'
      });
    }

    const nuevoProducto = new Producto({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria === undefined
        ? 'General'
        : categoria.trim(),
      precio,
      stock,
      stockMinimo: minimo
    });

    const productoGuardado = await nuevoProducto.save();

    return res.status(201).json({
      mensaje: 'Producto creado correctamente',
      producto: productoGuardado
    });
  } catch (error) {
    return responderError(res, error, 'crear producto');
  }
};

// ==========================================
// ACTUALIZAR PRODUCTO
// ==========================================

exports.actualizarProducto = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        mensaje: 'El identificador del producto no es válido'
      });
    }

    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    const camposTexto = [
      ['nombre', 'El nombre'],
      ['descripcion', 'La descripción']
    ];

    for (const [campo, etiqueta] of camposTexto) {
      if (tiene(req.body, campo)) {
        const errorTexto = validarTexto(req.body[campo], etiqueta);

        if (errorTexto) {
          return res.status(400).json({
            mensaje: errorTexto
          });
        }

        producto[campo] = req.body[campo].trim();
      }
    }

    if (tiene(req.body, 'categoria')) {
      if (
        typeof req.body.categoria !== 'string' ||
        !req.body.categoria.trim()
      ) {
        return res.status(400).json({
          mensaje: 'La categoría debe ser un texto no vacío'
        });
      }

      producto.categoria = req.body.categoria.trim();
    }

    if (tiene(req.body, 'precio')) {
      const errorPrecio = validarNumero(
        req.body.precio,
        'El precio'
      );

      if (errorPrecio) {
        return res.status(400).json({
          mensaje: errorPrecio
        });
      }

      producto.precio = req.body.precio;
    }

    if (tiene(req.body, 'stock')) {
      const errorStock = validarNumero(
        req.body.stock,
        'El stock',
        { entero: true }
      );

      if (errorStock) {
        return res.status(400).json({
          mensaje: errorStock
        });
      }

      producto.stock = req.body.stock;
    }

    if (tiene(req.body, 'stockMinimo')) {
      const errorMinimo = validarNumero(
        req.body.stockMinimo,
        'El stock mínimo',
        { entero: true }
      );

      if (errorMinimo) {
        return res.status(400).json({
          mensaje: errorMinimo
        });
      }

      producto.stockMinimo = req.body.stockMinimo;
    }

    if (tiene(req.body, 'activo')) {
      if (typeof req.body.activo !== 'boolean') {
        return res.status(400).json({
          mensaje: 'El campo activo debe ser verdadero o falso'
        });
      }

      producto.activo = req.body.activo;
    }

    // El modelo recalcula el estado al guardar.
    const productoActualizado = await producto.save();

    return res.status(200).json({
      mensaje: 'Producto actualizado correctamente',
      producto: productoActualizado
    });
  } catch (error) {
    return responderError(res, error, 'actualizar producto');
  }
};

// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

exports.eliminarProducto = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        mensaje: 'El identificador del producto no es válido'
      });
    }

    const producto = await Producto.findByIdAndDelete(
      req.params.id
    );

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      mensaje: 'Producto eliminado correctamente'
    });
  } catch (error) {
    return responderError(res, error, 'eliminar producto');
  }
};
