
const mongoose = require('mongoose');

const rolesDisponibles = [
  'Desarrollador',
  'Gerente',
  'Administrador',
  'Contador',
  'Empleado'
];

const rolesSolicitables = [
  'Gerente',
  'Administrador',
  'Contador',
  'Empleado'
];

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    // Rol efectivo que determina los permisos.
    rol: {
      type: String,
      enum: rolesDisponibles,
      default: 'Empleado'
    },

    // Rol solicitado durante el registro público.
    rolSolicitado: {
      type: String,
      enum: rolesSolicitables,
      default: 'Empleado'
    },

    // Estado de activación de la cuenta.
    activo: {
      type: Boolean,
      default: true
    },

    // Estado del proceso de aprobación.
    estadoAprobacion: {
      type: String,
      enum: ['pendiente', 'aprobado', 'rechazado'],
      default: 'aprobado'
    },

    // Usuario que aprobó o rechazó la solicitud.
    aprobadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null
    },

    fechaAprobacion: {
      type: Date,
      default: null
    },

    // Hash del token temporal de recuperación.
    tokenRecuperacion: {
      type: String,
      default: null,
      select: false
    },

    // Fecha y hora de vencimiento del token.
    expiracionTokenRecuperacion: {
      type: Date,
      default: null,
      select: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
