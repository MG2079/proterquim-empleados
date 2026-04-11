const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// 🔐 LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const esValido = await bcrypt.compare(password, usuario.password);

    if (!esValido) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// 📝 REGISTER (CREAR USUARIO BIEN)
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      email,
      password: passwordHash
    });

    await nuevoUsuario.save();

    res.json({ mensaje: 'Usuario creado correctamente' });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};