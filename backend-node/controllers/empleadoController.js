const mongoose = require('mongoose');
const Empleado = require('../models/Empleado');

// Validar los campos recibidos
const validarDatosEmpleado = (datos, esActualizacion = false) => {
    const errores = [];

    // Validar nombre
    if (!esActualizacion || datos.nombre !== undefined) {
        if (
            typeof datos.nombre !== 'string' ||
            !datos.nombre.trim()
        ) {
            errores.push('El nombre del empleado es obligatorio');
        } else if (datos.nombre.trim().length < 3) {
            errores.push('El nombre debe tener al menos 3 caracteres');
        } else if (datos.nombre.trim().length > 100) {
            errores.push('El nombre no puede superar los 100 caracteres');
        }
    }

    // Validar cargo
    if (!esActualizacion || datos.cargo !== undefined) {
        if (
            typeof datos.cargo !== 'string' ||
            !datos.cargo.trim()
        ) {
            errores.push('El cargo del empleado es obligatorio');
        } else if (datos.cargo.trim().length < 2) {
            errores.push('El cargo debe tener al menos 2 caracteres');
        } else if (datos.cargo.trim().length > 100) {
            errores.push('El cargo no puede superar los 100 caracteres');
        }
    }

    // Validar salario
    if (!esActualizacion || datos.salario !== undefined) {
        const salario = datos.salario;

        if (
            salario === '' ||
            salario === null ||
            salario === undefined ||
            typeof salario === 'boolean' ||
            (typeof salario !== 'number' && typeof salario !== 'string') ||
            (typeof salario === 'string' && !salario.trim()) ||
            !Number.isFinite(Number(salario))
        ) {
            errores.push('El salario debe ser un número válido');
        } else if (Number(salario) < 0) {
            errores.push('El salario no puede ser negativo');
        }
    }

    // Validar fecha de ingreso, si se proporciona
    if (datos.fechaIngreso !== undefined) {
        const fecha = new Date(datos.fechaIngreso);

        if (
            !datos.fechaIngreso ||
            Number.isNaN(fecha.getTime())
        ) {
            errores.push('La fecha de ingreso no es válida');
        }
    }

    return errores;
};

// Validar identificador de MongoDB
const validarId = (id) => mongoose.isValidObjectId(id);

// Crear empleado
exports.crearEmpleado = async (req, res) => {
    try {
        const errores = validarDatosEmpleado(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Los datos del empleado no son válidos',
                errores
            });
        }

        const datos = {
            nombre: req.body.nombre.trim(),
            cargo: req.body.cargo.trim(),
            salario: Number(req.body.salario)
        };

        if (req.body.fechaIngreso !== undefined) {
            datos.fechaIngreso = req.body.fechaIngreso;
        }

        const empleado = new Empleado(datos);
        await empleado.save();

        return res.status(201).json({
            mensaje: 'Empleado creado correctamente',
            empleado
        });
    } catch (error) {
        if (
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            return res.status(400).json({
                mensaje: 'Los datos del empleado no son válidos',
                error: error.message
            });
        }

        console.error('Error al crear empleado:', error);

        return res.status(500).json({
            mensaje: 'Error interno al crear el empleado'
        });
    }
};

// Obtener todos los empleados
exports.obtenerEmpleados = async (req, res) => {
    try {
        const empleados = await Empleado.find().sort({ nombre: 1 });

        return res.status(200).json(empleados);
    } catch (error) {
        console.error('Error al obtener empleados:', error);

        return res.status(500).json({
            mensaje: 'Error interno al obtener los empleados'
        });
    }
};

// Consultar empleado por ID
exports.obtenerEmpleadoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: 'El identificador del empleado no es válido'
            });
        }

        const empleado = await Empleado.findById(id);

        if (!empleado) {
            return res.status(404).json({
                mensaje: 'Empleado no encontrado'
            });
        }

        return res.status(200).json(empleado);
    } catch (error) {
        console.error('Error al buscar empleado:', error);

        return res.status(500).json({
            mensaje: 'Error interno al buscar empleado'
        });
    }
};

// Actualizar empleado
exports.actualizarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: 'El identificador del empleado no es válido'
            });
        }

        const camposPermitidos = [
            'nombre',
            'cargo',
            'salario',
            'fechaIngreso'
        ];

        const camposRecibidos = Object.keys(req.body);

        const camposNoPermitidos = camposRecibidos.filter(
            campo => !camposPermitidos.includes(campo)
        );

        if (camposNoPermitidos.length > 0) {
            return res.status(400).json({
                mensaje: 'La solicitud contiene campos no permitidos',
                campos: camposNoPermitidos
            });
        }

        const errores = validarDatosEmpleado(req.body, true);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Los datos del empleado no son válidos',
                errores
            });
        }

        const datos = { ...req.body };

        if (datos.nombre !== undefined) {
            datos.nombre = datos.nombre.trim();
        }

        if (datos.cargo !== undefined) {
            datos.cargo = datos.cargo.trim();
        }

        if (datos.salario !== undefined) {
            datos.salario = Number(datos.salario);
        }

        const empleado = await Empleado.findByIdAndUpdate(
            id,
            { $set: datos },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!empleado) {
            return res.status(404).json({
                mensaje: 'Empleado no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Empleado actualizado correctamente',
            empleado
        });
    } catch (error) {
        if (
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            return res.status(400).json({
                mensaje: 'Los datos del empleado no son válidos',
                error: error.message
            });
        }

        console.error('Error al actualizar empleado:', error);

        return res.status(500).json({
            mensaje: 'Error interno al actualizar el empleado'
        });
    }
};

// Eliminar empleado
exports.eliminarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: 'El identificador del empleado no es válido'
            });
        }

        const empleado = await Empleado.findByIdAndDelete(id);

        if (!empleado) {
            return res.status(404).json({
                mensaje: 'Empleado no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Empleado eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar empleado:', error);

        return res.status(500).json({
            mensaje: 'Error interno al eliminar el empleado'
        });
    }
};
