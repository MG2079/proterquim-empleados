const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema(

  {

    // 🔥 INFORMACIÓN GENERAL

    nombre: {
      type: String,
      required: true,
      trim: true
    },

    descripcion: {
      type: String,
      required: true,
      trim: true
    },

    categoria: {
      type: String,
      default: 'General'
    },

    // 🔥 INVENTARIO

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    stockMinimo: {
      type: Number,
      default: 20
    },

    // 🔥 PRECIO

    precio: {
      type: Number,
      required: true,
      min: 0
    },

    // 🔥 ESTADO AUTOMÁTICO

    estado: {
      type: String,
      enum: ['Normal', 'Bajo', 'Crítico'],
      default: 'Normal'
    },

    // 🔥 CONTROL

    activo: {
      type: Boolean,
      default: true
    }

  },

  {
    timestamps: true
  }

);

// 🔥 ACTUALIZAR ESTADO AUTOMÁTICO

ProductoSchema.pre('save', async function() {

  if (this.stock <= 0) {

    this.estado = 'Crítico';

  }

  else if (this.stock <= this.stockMinimo) {

    this.estado = 'Bajo';

  }

  else {

    this.estado = 'Normal';

  }

});

module.exports = mongoose.model(
  'Producto',
  ProductoSchema
);