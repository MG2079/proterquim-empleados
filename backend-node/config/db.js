const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/proterquim');
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error de conexión:', error);
    process.exit(1);
  }
};

module.exports = conectarDB;