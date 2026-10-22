
const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');
const verificarRol = require('../middlewares/roleMiddleware');

// ==========================================
// REGISTRO PÚBLICO, LOGIN Y RECUPERACIÓN
// ==========================================

// Registro de nuevos usuarios
router.post('/register', authController.registrar);

// Inicio de sesión
router.post('/login', authController.login);

// Solicitar recuperación de contraseña
router.post(
  '/solicitar-recuperacion',
  authController.solicitarRecuperacion
);

// Restablecer contraseña mediante token
router.post(
  '/restablecer-password',
  authController.restablecerPassword
);

// ==========================================
// GESTIÓN DE SOLICITUDES
// Solo Desarrollador, Administrador y Gerente
// ==========================================

// Consultar solicitudes pendientes
router.get(
  '/pendientes',
  verificarToken,
  verificarRol('Desarrollador', 'Administrador', 'Gerente'),
  authController.obtenerPendientes
);

// Aprobar o rechazar una solicitud
router.patch(
  '/:id/aprobacion',
  verificarToken,
  verificarRol('Desarrollador', 'Administrador', 'Gerente'),
  authController.resolverSolicitud
);

module.exports = router;
