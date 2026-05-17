const mongoose = require("mongoose");

const detallePedidoSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true
    },

    nombreProducto: {
        type: String,
        required: true
    },

    cantidad: {
        type: Number,
        required: true
    },

    precioUnitario: {
        type: Number,
        required: true
    },

    subtotal: {
        type: Number,
        required: true
    }
});

const pedidoSchema = new mongoose.Schema({

    cliente: {
        type: String,
        required: true
    },

    fecha: {
        type: Date,
        default: Date.now
    },

    productos: [detallePedidoSchema],

    total: {
        type: Number,
        required: true
    },

    estado: {
        type: String,
        enum: ["Pendiente", "Procesado", "Entregado", "Cancelado"],
        default: "Pendiente"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Pedido", pedidoSchema);