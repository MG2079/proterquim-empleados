const Producto = require('../models/Producto');

// 🔥 OBTENER TODOS LOS PRODUCTOS

exports.obtenerProductos = async (req, res) => {

  try {

    const productos = await Producto.find()

      .sort({ createdAt: -1 });

    res.status(200).json(productos);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      mensaje: 'Error al obtener productos'

    });

  }

};

// 🔥 OBTENER PRODUCTO POR ID

exports.obtenerProductoPorId = async (req, res) => {

  try {

    const producto = await Producto.findById(
      req.params.id
    );

    if (!producto) {

      return res.status(404).json({

        mensaje: 'Producto no encontrado'

      });

    }

    res.status(200).json(producto);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      mensaje: 'Error al obtener producto'

    });

  }

};

// 🔥 CREAR PRODUCTO

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

    // 🔥 VALIDACIONES

    if (

      !nombre ||
      !descripcion ||
      precio == null ||
      stock == null

    ) {

      return res.status(400).json({

        mensaje:
          'Todos los campos obligatorios deben completarse'

      });

    }

    // 🔥 NUEVO PRODUCTO

    const nuevoProducto = new Producto({

      nombre,
      descripcion,

      categoria:
        categoria || 'General',

      precio,

      stock,

      stockMinimo:
        stockMinimo || 20

    });

    const productoGuardado =
      await nuevoProducto.save();

    res.status(201).json({

      mensaje:
        'Producto creado correctamente',

      producto:
        productoGuardado

    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      mensaje:
        'Error al crear producto'

    });

  }

};

// 🔥 ACTUALIZAR PRODUCTO

exports.actualizarProducto = async (req, res) => {

  try {

    const producto = await Producto.findById(
      req.params.id
    );

    if (!producto) {

      return res.status(404).json({

        mensaje:
          'Producto no encontrado'

      });

    }

    // 🔥 ACTUALIZAR CAMPOS

    producto.nombre =
      req.body.nombre || producto.nombre;

    producto.descripcion =
      req.body.descripcion || producto.descripcion;

    producto.categoria =
      req.body.categoria || producto.categoria;

    producto.precio =
      req.body.precio ?? producto.precio;

    producto.stock =
      req.body.stock ?? producto.stock;

    producto.stockMinimo =
      req.body.stockMinimo ?? producto.stockMinimo;

    producto.activo =
      req.body.activo ?? producto.activo;

    // 🔥 ESTADO AUTOMÁTICO

    if (producto.stock <= 0) {

      producto.estado = 'Crítico';

    }

    else if (
      producto.stock <= producto.stockMinimo
    ) {

      producto.estado = 'Bajo';

    }

    else {

      producto.estado = 'Normal';

    }

    const productoActualizado =
      await producto.save();

    res.status(200).json({

      mensaje:
        'Producto actualizado correctamente',

      producto:
        productoActualizado

    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      mensaje:
        'Error al actualizar producto'

    });

  }

};

// 🔥 ELIMINAR PRODUCTO

exports.eliminarProducto = async (req, res) => {

  try {

    const producto =
      await Producto.findByIdAndDelete(
        req.params.id
      );

    if (!producto) {

      return res.status(404).json({

        mensaje:
          'Producto no encontrado'

      });

    }

    res.status(200).json({

      mensaje:
        'Producto eliminado correctamente'

    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      mensaje:
        'Error al eliminar producto'

    });

  }

};