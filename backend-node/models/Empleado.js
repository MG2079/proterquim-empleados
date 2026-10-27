
const mongoose = require('mongoose');

const empleadoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del empleado es obligatorio'],
            trim: true,
            minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
            maxlength: [100, 'El nombre no puede superar los 100 caracteres']
        },

        cargo: {
            type: String,
            required: [true, 'El cargo del empleado es obligatorio'],
            trim: true,
            minlength: [2, 'El cargo debe tener al menos 2 caracteres'],
            maxlength: [100, 'El cargo no puede superar los 100 caracteres']
        },

        salario: {
            type: Number,
            required: [true, 'El salario del empleado es obligatorio'],
            min: [0, 'El salario no puede ser negativo'],
            validate: {
                validator: Number.isFinite,
                message: 'El salario debe ser un número válido'
            }
        },

        fechaIngreso: {
            type: Date,
            default: Date.now,
            validate: {
                validator: function (fecha) {
                    return fecha instanceof Date &&
                        !Number.isNaN(fecha.getTime());
                },
                message: 'La fecha de ingreso no es válida'
            }
        }
    },
    {
        timestamps: true
    }
);

// Crear el modelo
const Empleado = mongoose.model('Empleado', empleadoSchema);

// Exportar
module.exports = Empleado;
