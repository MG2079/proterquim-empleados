
const mongoose = require("mongoose");
const Pedido = require("../models/Pedido");
const Producto = require("../models/Producto");

// Error controlado para devolver respuestas HTTP específicas.
class ErrorPedido extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

const responderError = (res, error, operacion) => {
    if (error instanceof ErrorPedido) {
        return res.status(error.status).json({
            mensaje: error.message
        });
    }

    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {
        return res.status(400).json({
            mensaje: "Los datos del pedido no son válidos",
            detalle: error.message
        });
    }

    console.error(`Error en ${operacion}:`, error);

    return res.status(500).json({
        mensaje: `Error al ${operacion}`
    });
};

const estadoInventario = (stock, stockMinimo = 20) => {
    if (stock <= 10) return "Crítico";
    if (stock <= stockMinimo) return "Bajo";
    return "Normal";
};

// Agrupa productos repetidos para calcular y descontar
// correctamente la cantidad total de cada producto.
const normalizarProductos = (productos) => {
    if (!Array.isArray(productos) || productos.length === 0) {
        throw new ErrorPedido(
            400,
            "Debe agregar al menos un producto"
        );
    }

    const cantidades = new Map();

    for (const item of productos) {
        if (!item || !mongoose.isValidObjectId(item.producto)) {
            throw new ErrorPedido(
                400,
                "Hay un producto con un identificador inválido"
            );
        }

        const cantidad = Number(item.cantidad);

        if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
            throw new ErrorPedido(
                400,
                "Las cantidades deben ser números enteros mayores que cero"
            );
        }

        const id = String(item.producto);
        const cantidadAcumulada =
            (cantidades.get(id) || 0) + cantidad;

        if (!Number.isSafeInteger(cantidadAcumulada)) {
            throw new ErrorPedido(
                400,
                "La cantidad solicitada es demasiado grande"
            );
        }

        cantidades.set(id, cantidadAcumulada);
    }

    return Array.from(cantidades, ([producto, cantidad]) => ({
        producto,
        cantidad
    }));
};

// Actualiza el estado del inventario de un producto.
const guardarEstadoInventario = async (producto, session) => {
    producto.estado = estadoInventario(
        Number(producto.stock),
        Number(producto.stockMinimo ?? 20)
    );

    await producto.save({ session });
};

// Restaura el stock y cancela el pedido dentro de la misma
// transacción. No permite devolver unidades dos veces.
const cancelarPedidoEnTransaccion = async (pedido, session) => {
    if (pedido.estado === "Cancelado") {
        return {
            pedido,
            yaEstabaCancelado: true
        };
    }

    if (pedido.estado === "Entregado") {
        throw new ErrorPedido(
            409,
            "No se puede cancelar un pedido que ya fue entregado"
        );
    }

    if (!["Pendiente", "Procesado"].includes(pedido.estado)) {
        throw new ErrorPedido(
            409,
            "El estado actual del pedido no permite cancelarlo"
        );
    }

    // Agrupa las líneas que tengan el mismo producto.
    const cantidades = new Map();

    for (const item of pedido.productos) {
        const id = String(item.producto);

        cantidades.set(
            id,
            (cantidades.get(id) || 0) + Number(item.cantidad)
        );
    }

    for (const [id, cantidad] of cantidades) {
        if (
            !mongoose.isValidObjectId(id) ||
            !Number.isSafeInteger(cantidad) ||
            cantidad <= 0
        ) {
            throw new ErrorPedido(
                409,
                "No se puede restituir el inventario: el detalle del pedido es inválido"
            );
        }

        const producto = await Producto.findById(id).session(session);

        if (!producto) {
            throw new ErrorPedido(
                409,
                `No se puede restituir el inventario: falta el producto ${id}`
            );
        }

        const nuevoStock = Number(producto.stock) + cantidad;

        if (!Number.isSafeInteger(nuevoStock) || nuevoStock < 0) {
            throw new ErrorPedido(
                409,
                `El stock resultante no es válido para ${producto.nombre}`
            );
        }

        producto.stock = nuevoStock;

        await guardarEstadoInventario(producto, session);
    }

    pedido.estado = "Cancelado";
    await pedido.save({ session });

    return {
        pedido,
        yaEstabaCancelado: false
    };
};

// OBTENER PEDIDOS ACTIVOS
// Los cancelados permanecen en MongoDB para conservar
// la trazabilidad, pero no aparecen en la lista principal.
exports.obtenerPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find({
            estado: { $ne: "Cancelado" }
        }).sort({ createdAt: -1 });

        return res.status(200).json(pedidos);
    } catch (error) {
        return responderError(res, error, "obtener pedidos");
    }
};

// CREAR PEDIDO
exports.crearPedido = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const cliente =
            typeof req.body.cliente === "string"
                ? req.body.cliente.trim()
                : "";

        if (!cliente) {
            throw new ErrorPedido(
                400,
                "El cliente es obligatorio"
            );
        }

        const productosSolicitados =
            normalizarProductos(req.body.productos);

        let pedidoCreado;

        await session.withTransaction(async () => {
            const detalle = [];
            let total = 0;

            // Validar productos y calcular importes con precios
            // almacenados en la base de datos.
            for (const item of productosSolicitados) {
                const producto = await Producto.findById(item.producto)
                    .session(session);

                if (!producto) {
                    throw new ErrorPedido(
                        404,
                        `No se encontró el producto ${item.producto}`
                    );
                }

                const precio = Number(producto.precio);
                const stock = Number(producto.stock);

                if (!Number.isFinite(precio) || precio < 0) {
                    throw new ErrorPedido(
                        409,
                        `El precio de ${producto.nombre} no es válido`
                    );
                }

                if (!Number.isSafeInteger(stock) || stock < 0) {
                    throw new ErrorPedido(
                        409,
                        `El stock de ${producto.nombre} no es válido`
                    );
                }

                if (stock < item.cantidad) {
                    throw new ErrorPedido(
                        400,
                        `Stock insuficiente para ${producto.nombre}. Disponible: ${stock}`
                    );
                }

                const subtotal = precio * item.cantidad;

                if (!Number.isFinite(subtotal)) {
                    throw new ErrorPedido(
                        400,
                        "El subtotal calculado no es válido"
                    );
                }

                total += subtotal;

                if (!Number.isFinite(total)) {
                    throw new ErrorPedido(
                        400,
                        "El total calculado no es válido"
                    );
                }

                detalle.push({
                    id: String(producto._id),
                    cantidad: item.cantidad,
                    nombreProducto: producto.nombre,
                    precioUnitario: precio,
                    subtotal
                });
            }

            // Descuento condicional para evitar stock negativo.
            for (const item of detalle) {
                const producto = await Producto.findOneAndUpdate(
                    {
                        _id: item.id,
                        stock: { $gte: item.cantidad }
                    },
                    {
                        $inc: { stock: -item.cantidad }
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!producto) {
                    const existe = await Producto.findById(item.id)
                        .session(session);

                    if (!existe) {
                        throw new ErrorPedido(
                            404,
                            "Uno de los productos ya no existe"
                        );
                    }

                    throw new ErrorPedido(
                        409,
                        `El stock de ${existe.nombre} cambió. Actualiza los productos e inténtalo de nuevo`
                    );
                }

                await guardarEstadoInventario(producto, session);
            }

            const nuevoPedido = new Pedido({
                cliente,
                productos: detalle.map(item => ({
                    producto: item.id,
                    nombreProducto: item.nombreProducto,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                    subtotal: item.subtotal
                })),
                total,
                estado: "Pendiente"
            });

            await nuevoPedido.save({ session });
            pedidoCreado = nuevoPedido;
        });

        return res.status(201).json({
            mensaje: "Pedido creado correctamente",
            pedido: pedidoCreado
        });
    } catch (error) {
        return responderError(res, error, "crear pedido");
    } finally {
        await session.endSession();
    }
};

// OBTENER PEDIDO POR ID
exports.obtenerPedidoPorId = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                mensaje: "El identificador del pedido no es válido"
            });
        }

        const pedido = await Pedido.findById(req.params.id);

        if (!pedido) {
            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });
        }

        return res.status(200).json(pedido);
    } catch (error) {
        return responderError(res, error, "obtener pedido");
    }
};

// ACTUALIZAR ESTADO DEL PEDIDO
// No permite modificar productos, precios, cantidades ni total
// mediante una actualización genérica.
exports.actualizarPedido = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            throw new ErrorPedido(
                400,
                "El identificador del pedido no es válido"
            );
        }

        const nuevoEstado = req.body.estado;

        const estadosPermitidos = [
            "Pendiente",
            "Procesado",
            "Entregado",
            "Cancelado"
        ];

        if (!estadosPermitidos.includes(nuevoEstado)) {
            throw new ErrorPedido(
                400,
                "El estado solicitado no es válido"
            );
        }

        let pedidoActualizado;
        let yaEstabaCancelado = false;

        await session.withTransaction(async () => {
            const pedido = await Pedido.findById(req.params.id)
                .session(session);

            if (!pedido) {
                throw new ErrorPedido(
                    404,
                    "Pedido no encontrado"
                );
            }

            if (pedido.estado === nuevoEstado) {
                pedidoActualizado = pedido;
                yaEstabaCancelado = nuevoEstado === "Cancelado";
                return;
            }

            if (pedido.estado === "Cancelado") {
                throw new ErrorPedido(
                    409,
                    "Un pedido cancelado no se puede reactivar"
                );
            }

            if (nuevoEstado === "Cancelado") {
                const resultado = await cancelarPedidoEnTransaccion(
                    pedido,
                    session
                );

                pedidoActualizado = resultado.pedido;
                yaEstabaCancelado = resultado.yaEstabaCancelado;
                return;
            }

            const transiciones = {
                Pendiente: ["Procesado"],
                Procesado: ["Entregado"],
                Entregado: []
            };

            if (!transiciones[pedido.estado]?.includes(nuevoEstado)) {
                throw new ErrorPedido(
                    409,
                    `No se permite cambiar de ${pedido.estado} a ${nuevoEstado}`
                );
            }

            pedido.estado = nuevoEstado;
            await pedido.save({ session });
            pedidoActualizado = pedido;
        });

        return res.status(200).json({
            mensaje: yaEstabaCancelado
                ? "El pedido ya estaba cancelado"
                : "Pedido actualizado correctamente",
            pedido: pedidoActualizado
        });
    } catch (error) {
        return responderError(res, error, "actualizar pedido");
    } finally {
        await session.endSession();
    }
};

// ELIMINAR PEDIDO
// La eliminación lógica cancela el pedido y restituye
// el inventario una sola vez, conservando la trazabilidad.
exports.eliminarPedido = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            throw new ErrorPedido(
                400,
                "El identificador del pedido no es válido"
            );
        }

        let pedidoCancelado;
        let yaEstabaCancelado = false;

        await session.withTransaction(async () => {
            const pedido = await Pedido.findById(req.params.id)
                .session(session);

            if (!pedido) {
                throw new ErrorPedido(
                    404,
                    "Pedido no encontrado"
                );
            }

            const resultado = await cancelarPedidoEnTransaccion(
                pedido,
                session
            );

            pedidoCancelado = resultado.pedido;
            yaEstabaCancelado = resultado.yaEstabaCancelado;
        });

        return res.status(200).json({
            mensaje: yaEstabaCancelado
                ? "El pedido ya estaba cancelado"
                : "Pedido cancelado e inventario restituido correctamente",
            pedido: pedidoCancelado
        });
    } catch (error) {
        return responderError(res, error, "cancelar pedido");
    } finally {
        await session.endSession();
    }
};
