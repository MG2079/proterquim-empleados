const Pedido = require("../models/Pedido");
const Producto = require("../models/Producto");
const Empleado = require("../models/Empleado");

// Solo estos estados se consideran ventas realizadas.
const ESTADOS_VENTA = ["Procesado", "Entregado"];
const ESTADO_PENDIENTE = "Pendiente";
const ESTADO_CANCELADO = "Cancelado";

// ==========================================
// DASHBOARD GENERAL
// ==========================================

exports.obtenerDashboard = async (req, res) => {
    try {
        const [
            totalProductos,
            totalEmpleados,
            totalPedidos,
            pedidosVenta,
            pedidosPendientes,
            pedidosCancelados,
            ultimosPedidos,
            productosInventario
        ] = await Promise.all([
            Producto.countDocuments(),
            Empleado.countDocuments(),
            Pedido.countDocuments(),
            Pedido.find({ estado: { $in: ESTADOS_VENTA } }),
            Pedido.find({ estado: ESTADO_PENDIENTE }),
            Pedido.find({ estado: ESTADO_CANCELADO }),
            Pedido.find().sort({ createdAt: -1 }).limit(5),
            Producto.find({
                stock: { $lte: 30 },
                activo: { $ne: false }
            }).sort({ stock: 1 })
        ]);

        const sumarTotales = pedidos =>
            pedidos.reduce(
                (acumulado, pedido) =>
                    acumulado + (Number(pedido.total) || 0),
                0
            );

        const ventasTotales = sumarTotales(pedidosVenta);
        const valorPedidosPendientes = sumarTotales(pedidosPendientes);
        const valorPedidosCancelados = sumarTotales(pedidosCancelados);

        const productosCriticos = productosInventario.map(producto => {
            const datos = producto.toObject();

            datos.estado =
                datos.stock < 20 ? "Crítico" : "Bajo";

            return datos;
        });

        res.status(200).json({
            totalProductos,
            totalEmpleados,
            totalPedidos,

            ventasTotales,
            pedidosRealizados: pedidosVenta.length,

            pedidosPendientes: pedidosPendientes.length,
            valorPedidosPendientes,

            pedidosCancelados: pedidosCancelados.length,
            valorPedidosCancelados,

            stockBajo: productosInventario.length,
            ultimosPedidos,
            productosCriticos
        });
    } catch (error) {
        console.error("Error al obtener dashboard:", error);

        res.status(500).json({
            mensaje: "Error al obtener dashboard"
        });
    }
};

// ==========================================
// REPORTE DE VENTAS Y PEDIDOS
// ==========================================

exports.obtenerVentas = async (req, res) => {
    try {
        const pedidos = await Pedido.find()
            .sort({ createdAt: -1 });

        res.status(200).json(pedidos);
    } catch (error) {
        console.error("Error al obtener ventas:", error);

        res.status(500).json({
            mensaje: "Error al obtener ventas"
        });
    }
};

// ==========================================
// PRODUCTOS MÁS VENDIDOS
// ==========================================

exports.obtenerProductosMasVendidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find({
            estado: { $in: ESTADOS_VENTA }
        });

        const productosMap = {};

        pedidos.forEach(pedido => {
            (pedido.productos || []).forEach(producto => {
                const nombre = producto.nombreProducto;

                if (!nombre) return;

                if (!productosMap[nombre]) {
                    productosMap[nombre] = {
                        cantidad: 0,
                        ingresos: 0
                    };
                }

                productosMap[nombre].cantidad +=
                    Number(producto.cantidad) || 0;

                productosMap[nombre].ingresos +=
                    Number(producto.subtotal) || 0;
            });
        });

        const productos = Object.entries(productosMap).map(
            ([nombre, datos]) => ({
                nombre,
                cantidad: datos.cantidad,
                ingresos: datos.ingresos
            })
        );

        productos.sort((a, b) => b.cantidad - a.cantidad);

        res.status(200).json(productos);
    } catch (error) {
        console.error("Error al obtener productos vendidos:", error);

        res.status(500).json({
            mensaje: "Error al obtener productos vendidos"
        });
    }
};

// ==========================================
// INVENTARIO BAJO O CRÍTICO
// ==========================================

exports.obtenerInventarioCritico = async (req, res) => {
    try {
        const productos = await Producto.find({
            stock: { $lte: 30 },
            activo: { $ne: false }
        }).sort({ stock: 1 });

        const resultado = productos.map(producto => {
            const datos = producto.toObject();

            datos.estado =
                datos.stock < 20 ? "Crítico" : "Bajo";

            return datos;
        });

        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error al obtener inventario crítico:", error);

        res.status(500).json({
            mensaje: "Error al obtener inventario crítico"
        });
    }
};
