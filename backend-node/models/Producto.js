
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
      minlength: [1, 'El nombre no puede estar vacío']
    },

    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      minlength: [1, 'La descripción no puede estar vacía']
    },

    categoria: {
      type: String,
      trim: true,
      default: 'General'
    },

    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: 'El stock debe ser un número entero válido'
      }
    },

    stockMinimo: {
      type: Number,
      required: true,
      default: 20,
      min: [0, 'El stock mínimo no puede ser negativo'],
      validate: {
        validator: Number.isSafeInteger,
        message: 'El stock mínimo debe ser un número entero válido'
      }
    },

    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
      validate: {
        validator: Number.isFinite,
        message: 'El precio debe ser un número válido'
      }
    },

    estado: {
      type: String,
      enum: ['Normal', 'Bajo', 'Crítico'],
      default: 'Normal'
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Clasificación única para todos los productos.
ProductoSchema.methods.actualizarEstadoInventario = function () {
  if (this.stock < 20) {
    this.estado = 'Crítico';
  } else if (this.stock <= 30) {
    this.estado = 'Bajo';
  } else {
    this.estado = 'Normal';
  }
};

// Recalcular el estado antes de guardar.
ProductoSchema.pre('save', function () {
  this.actualizarEstadoInventario();
});

module.exports = mongoose.model('Producto', ProductoSchema);
