const mongoose = require('mongoose');

// Definir el esquema
const empleadoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    cargo: {
        type: String,
        required: true
    },
    salario: {
        type: Number,
        required: true
    },
    fechaIngreso: {
        type: Date,
        default: Date.now
    }
});

// Crear el modelo
const Empleado = mongoose.model('Empleado', empleadoSchema);

// Exportar
module.exports = Empleado;