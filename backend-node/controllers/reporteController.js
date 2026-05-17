const Pedido = require("../models/Pedido");
const Producto = require("../models/Producto");
const Empleado = require("../models/Empleado");


// ==========================================
// 🔥 DASHBOARD GENERAL
// ==========================================

exports.obtenerDashboard = async (req, res) => {

    try {

        // 🔥 PRODUCTOS

        const totalProductos =
            await Producto.countDocuments();

        // 🔥 EMPLEADOS

        const totalEmpleados =
            await Empleado.countDocuments();

        // 🔥 PEDIDOS

        const totalPedidos =
            await Pedido.countDocuments();

        // 🔥 VENTAS TOTALES

        const pedidos =
            await Pedido.find();

        const ventasTotales =
            pedidos.reduce(

                (acc, pedido) =>
                    acc + pedido.total,

                0

            );

        // 🔥 STOCK BAJO

        const stockBajo =
            await Producto.countDocuments({

                estado: {
                    $in: ["Bajo", "Crítico"]
                }

            });

        // 🔥 ÚLTIMOS PEDIDOS

        const ultimosPedidos =
            await Pedido.find()
                .sort({ createdAt: -1 })
                .limit(5);

        // 🔥 PRODUCTOS CRÍTICOS

        const productosCriticos =
            await Producto.find({

                estado: {
                    $in: ["Bajo", "Crítico"]
                }

            });

        // 🔥 RESPUESTA

        res.status(200).json({

            totalProductos,

            totalEmpleados,

            totalPedidos,

            ventasTotales,

            stockBajo,

            ultimosPedidos,

            productosCriticos

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje:
                "Error al obtener dashboard"

        });

    }

};


// ==========================================
// 🔥 REPORTE DE VENTAS
// ==========================================

exports.obtenerVentas = async (req, res) => {

    try {

        const ventas =
            await Pedido.find()
                .sort({ createdAt: -1 });

        res.status(200).json(ventas);

    } catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje:
                "Error al obtener ventas"

        });

    }

};


// ==========================================
// 🔥 PRODUCTOS MÁS VENDIDOS
// ==========================================

exports.obtenerProductosMasVendidos =
    async (req, res) => {

        try {

            const pedidos =
                await Pedido.find();

            const productosMap = {};

            // 🔥 RECORRER PEDIDOS

            pedidos.forEach(pedido => {

                pedido.productos.forEach(producto => {

                    if (!productosMap[
                        producto.nombreProducto
                    ]) {

                        productosMap[
                            producto.nombreProducto
                        ] = {

                            cantidad: 0,
                            ingresos: 0

                        };

                    }

                    productosMap[
                        producto.nombreProducto
                    ].cantidad += producto.cantidad;

                    productosMap[
                        producto.nombreProducto
                    ].ingresos += producto.subtotal;

                });

            });

            // 🔥 CONVERTIR A ARRAY

            const productos =
                Object.keys(productosMap)
                    .map(nombre => ({

                        nombre,

                        cantidad:
                            productosMap[nombre]
                                .cantidad,

                        ingresos:
                            productosMap[nombre]
                                .ingresos

                    }));

            // 🔥 ORDENAR

            productos.sort(

                (a, b) =>
                    b.cantidad - a.cantidad

            );

            res.status(200).json(productos);

        } catch (error) {

            console.log(error);

            res.status(500).json({

                mensaje:
                    "Error al obtener productos vendidos"

            });

        }

    };


// ==========================================
// 🔥 INVENTARIO CRÍTICO
// ==========================================

exports.obtenerInventarioCritico =
    async (req, res) => {

        try {

            const productos =
                await Producto.find({

                    estado: {
                        $in: ["Bajo", "Crítico"]
                    }

                });

            res.status(200).json(productos);

        } catch (error) {

            console.log(error);

            res.status(500).json({

                mensaje:
                    "Error al obtener inventario crítico"

            });

        }

    };