const express = require('express');

const router = express.Router();

const reporteController = require(
  '../controllers/reporteController'
);

const verificarToken =
require('../middlewares/authMiddleware');

// 🔥 DASHBOARD / REPORTES
router.get(
  '/',
  verificarToken,
  reporteController.obtenerDashboard
);

module.exports = router;