const Pedido = require("../models/Pedido");
const Producto = require("../models/Producto");


// 🔥 OBTENER TODOS LOS PEDIDOS

exports.obtenerPedidos = async (req, res) => {

    try {

        const pedidos = await Pedido.find()
            .sort({ createdAt: -1 });

        res.status(200).json(pedidos);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener pedidos"
        });

    }

};


// 🔥 CREAR PEDIDO

exports.crearPedido = async (req, res) => {

    try {

        const {
            cliente,
            productos
        } = req.body;

        // 🔥 VALIDAR CLIENTE

        if (!cliente) {

            return res.status(400).json({
                mensaje: "El cliente es obligatorio"
            });

        }

        // 🔥 VALIDAR PRODUCTOS

        if (!productos || productos.length === 0) {

            return res.status(400).json({
                mensaje: "Debe agregar productos"
            });

        }

        let totalPedido = 0;

        const productosPedido = [];

        // 🔥 VALIDAR INVENTARIO

        for (const item of productos) {

            const productoDB =
                await Producto.findById(item.producto);

            // 🔥 VALIDAR EXISTENCIA

            if (!productoDB) {

                return res.status(404).json({
                    mensaje: "Producto no encontrado"
                });

            }

            // 🔥 VALIDAR STOCK

            if (productoDB.stock < item.cantidad) {

                return res.status(400).json({
                    mensaje:
                        `Stock insuficiente para ${productoDB.nombre}`
                });

            }

            // 🔥 CALCULAR SUBTOTAL

            const subtotal =
                productoDB.precio * item.cantidad;

            // 🔥 ACUMULAR TOTAL

            totalPedido += subtotal;

            // 🔥 ARMAR DETALLE

            productosPedido.push({

                producto: productoDB._id,

                nombreProducto: productoDB.nombre,

                cantidad: item.cantidad,

                precioUnitario: productoDB.precio,

                subtotal: subtotal

            });

        }

        // 🔥 DESCONTAR INVENTARIO

        for (const item of productos) {

            const productoDB =
                await Producto.findById(item.producto);

            productoDB.stock =
                productoDB.stock - item.cantidad;

            // 🔥 ESTADO AUTOMÁTICO

            if (productoDB.stock <= 10) {

                productoDB.estado = "Crítico";

            }

            else if (productoDB.stock <= 20) {

                productoDB.estado = "Bajo";

            }

            else {

                productoDB.estado = "Normal";

            }

            await productoDB.save();

        }

        // 🔥 CREAR PEDIDO

        const nuevoPedido = new Pedido({

            cliente,

            productos: productosPedido,

            total: totalPedido,

            estado: "Pendiente"

        });

        await nuevoPedido.save();

        res.status(201).json({

            mensaje: "Pedido creado correctamente",

            pedido: nuevoPedido

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje: "Error al crear pedido"

        });

    }

};


// 🔥 OBTENER PEDIDO POR ID

exports.obtenerPedidoPorId = async (req, res) => {

    try {

        const pedido =
            await Pedido.findById(req.params.id);

        if (!pedido) {

            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });

        }

        res.status(200).json(pedido);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener pedido"
        });

    }

};


// 🔥 ACTUALIZAR PEDIDO

exports.actualizarPedido = async (req, res) => {

    try {

        const pedido =
            await Pedido.findByIdAndUpdate(

                req.params.id,

                req.body,

                { new: true }

            );

        if (!pedido) {

            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });

        }

        res.status(200).json({

            mensaje: "Pedido actualizado",

            pedido

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al actualizar pedido"
        });

    }

};


// 🔥 ELIMINAR PEDIDO

exports.eliminarPedido = async (req, res) => {

    try {

        const pedido =
            await Pedido.findByIdAndDelete(
                req.params.id
            );

        if (!pedido) {

            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });

        }

        res.status(200).json({
            mensaje: "Pedido eliminado correctamente"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al eliminar pedido"
        });

    }

};