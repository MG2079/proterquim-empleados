require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 🔥 1. PRIMERO LOS MIDDLEWARES
app.use(cors());
app.use(express.json());

// 🔥 2. LUEGO LAS RUTAS
const productoRoutes = require('./routes/productoRoutes');
app.use('/api/productos', productoRoutes);

const empleadoRoutes = require('./routes/empleadoRoutes');
app.use('/api/empleados', empleadoRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// 🔹 Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando');
});

// 🔹 Conexión a MongoDB
const conectarDB = require('./config/db');
conectarDB();

// 🔹 Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

