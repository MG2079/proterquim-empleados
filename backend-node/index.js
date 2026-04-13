require('dotenv').config();

const express = require('express');
const cors = require('cors');

const conectarDB = require('./config/db');

const productoRoutes = require('./routes/productoRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 🔹 MIDDLEWARES
app.use(cors());
app.use(express.json());

// 🔹 CONEXIÓN A BASE DE DATOS
conectarDB();

// 🔹 RUTAS API
app.use('/api/productos', productoRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/auth', authRoutes);

// 🔹 RUTA BASE (SALUD DEL SERVIDOR)
app.get('/', (req, res) => {
  res.send('API Proterquim funcionando correctamente');
});

// 🔹 MANEJO BÁSICO DE ERRORES (OPCIONAL PERO PROFESIONAL)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// 🔹 PUERTO
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
