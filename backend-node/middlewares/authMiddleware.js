
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Comprobar formato Bearer
    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        mensaje: 'Token no proporcionado o formato inválido'
      });
    }

    // Comprobar configuración del servidor
    if (!process.env.JWT_SECRET) {
      console.error('Falta configurar JWT_SECRET');

      return res.status(500).json({
        mensaje: 'Error de configuración de autenticación'
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        mensaje: 'Token no proporcionado'
      });
    }

    // Verificar firma y expiración del token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      !decoded.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return res.status(401).json({
        mensaje: 'Token inválido'
      });
    }

    // Consultar el estado y el rol actuales en MongoDB
    const usuario = await Usuario.findById(decoded.id).select(
      '_id nombre email rol activo estadoAprobacion'
    );

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'El usuario ya no existe'
      });
    }

    if (usuario.activo === false) {
      return res.status(403).json({
        mensaje: 'La cuenta está inactiva'
      });
    }

    if (
      usuario.estadoAprobacion &&
      usuario.estadoAprobacion !== 'aprobado'
    ) {
      return res.status(403).json({
        mensaje: 'La cuenta no está aprobada'
      });
    }

    // Usar los datos actuales de la base de datos
    req.usuario = {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'La sesión ha expirado. Inicia sesión nuevamente.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        mensaje: 'Token inválido'
      });
    }

    console.error('Error al verificar token:', error);

    return res.status(500).json({
      mensaje: 'Error al validar la autenticación'
    });
  }
};

module.exports = verificarToken;
