const Empleado = require('../models/Empleado');

// 🔹 Crear empleado
exports.crearEmpleado = async (req, res) => {
    try {
        const empleado = new Empleado(req.body);
        await empleado.save();
        res.status(201).json(empleado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear empleado', error });
    }
};

// 🔹 Obtener todos los empleados
exports.obtenerEmpleados = async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener empleados', error });
    }
};

// 🔹 Obtener un empleado por ID
exports.obtenerEmpleadoPorId = async (req, res) => {
    try {
        const empleado = await Empleado.findById(req.params.id);
        if (!empleado) {
            return res.status(404).json({ mensaje: 'Empleado no encontrado' });
        }
        res.json(empleado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar empleado', error });
    }
};

// 🔹 Actualizar empleado
exports.actualizarEmpleado = async (req, res) => {
    try {
        const empleado = await Empleado.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!empleado) {
            return res.status(404).json({ mensaje: 'Empleado no encontrado' });
        }

        res.json(empleado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar empleado', error });
    }
};

// 🔹 Eliminar empleado
exports.eliminarEmpleado = async (req, res) => {
    try {
        const empleado = await Empleado.findByIdAndDelete(req.params.id);

        if (!empleado) {
            return res.status(404).json({ mensaje: 'Empleado no encontrado' });
        }

        res.json({ mensaje: 'Empleado eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar empleado', error });
    }
};