const express = require('express');

const router = express.Router();

const reporteController = require(
  '../controllers/reporteController'
);

const verificarToken =
require('../middlewares/authMiddleware');


// ==========================================
// 📊 DASHBOARD
// ==========================================

router.get(
  '/dashboard',
  verificarToken,
  reporteController.obtenerDashboard
);


// ==========================================
// 💰 REPORTE DE VENTAS
// ==========================================

router.get(
  '/ventas',
  verificarToken,
  reporteController.obtenerVentas
);


// ==========================================
// 🔥 PRODUCTOS MÁS VENDIDOS
// ==========================================

router.get(
  '/productos-mas-vendidos',
  verificarToken,
  reporteController.obtenerProductosMasVendidos
);


// ==========================================
// ⚠️ INVENTARIO CRÍTICO
// ==========================================

router.get(
  '/inventario-critico',
  verificarToken,
  reporteController.obtenerInventarioCritico
);

module.exports = router;