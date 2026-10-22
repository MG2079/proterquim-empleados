const mongoose = require("mongoose");

const detallePedidoSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true
    },

    nombreProducto: {
        type: String,
        required: true,
        trim: true
    },

    cantidad: {
        type: Number,
        required: true,
        min: [1, "La cantidad debe ser mayor que cero"],
        validate: {
            validator: Number.isSafeInteger,
            message: "La cantidad debe ser un número entero válido"
        }
    },

    precioUnitario: {
        type: Number,
        required: true,
        min: [0, "El precio no puede ser negativo"],
        validate: {
            validator: Number.isFinite,
            message: "El precio debe ser un número válido"
        }
    },

    subtotal: {
        type: Number,
        required: true,
        min: [0, "El subtotal no puede ser negativo"],
        validate: {
            validator: Number.isFinite,
            message: "El subtotal debe ser un número válido"
        }
    }
});

const pedidoSchema = new mongoose.Schema({
    cliente: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, "El cliente es obligatorio"]
    },

    fecha: {
        type: Date,
        default: Date.now
    },

    productos: {
        type: [detallePedidoSchema],
        required: true,
        validate: {
            validator: productos => productos.length > 0,
            message: "El pedido debe contener al menos un producto"
        }
    },

    total: {
        type: Number,
        required: true,
        min: [0, "El total no puede ser negativo"],
        validate: {
            validator: Number.isFinite,
            message: "El total debe ser un número válido"
        }
    },

    estado: {
        type: String,
        enum: ["Pendiente", "Procesado", "Entregado", "Cancelado"],
        default: "Pendiente",
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Pedido", pedidoSchema);
