const Usuario = require('../models/Usuario');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');


// ==========================================
// 🔐 REGISTRAR USUARIO
// ==========================================

exports.registrar = async (req, res) => {

  try {

    const {
      nombre,
      email,
      password,
      rol
    } = req.body;

    // 🔍 VALIDAR EMAIL

    const usuarioExiste = await Usuario.findOne({
      email
    });

    if (usuarioExiste) {

      return res.status(400).json({
        mensaje: 'El usuario ya existe'
      });

    }

    // 🔒 ENCRIPTAR PASSWORD

    const salt = await bcrypt.genSalt(10);

    const passwordHash =
      await bcrypt.hash(password, salt);

    // 👤 CREAR USUARIO

    const nuevoUsuario = new Usuario({

      nombre,
      email,
      password: passwordHash,
      rol

    });

    await nuevoUsuario.save();

    // 🎫 TOKEN

    const token = jwt.sign(

      {
        id: nuevoUsuario._id,
        rol: nuevoUsuario.rol
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '8h'
      }

    );

    // ✅ RESPUESTA

    res.status(201).json({

      mensaje: 'Usuario registrado',

      token,

      usuario: {

        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol

      }

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje: 'Error al registrar usuario'

    });

  }

};


// ==========================================
// 🔐 LOGIN
// ==========================================

exports.login = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // 🔍 BUSCAR USUARIO

    const usuario = await Usuario.findOne({
      email
    });

    if (!usuario) {

      return res.status(400).json({

        mensaje: 'Usuario no encontrado'

      });

    }

    // 🔒 VALIDAR PASSWORD

    const passwordCorrecta =
      await bcrypt.compare(
        password,
        usuario.password
      );

    if (!passwordCorrecta) {

      return res.status(400).json({

        mensaje: 'Contraseña incorrecta'

      });

    }

    // 🎫 TOKEN

    const token = jwt.sign(

      {
        id: usuario._id,
        rol: usuario.rol
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '8h'
      }

    );

    // ✅ RESPUESTA

    res.status(200).json({

      mensaje: 'Login exitoso',

      token,

      usuario: {

        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol

      }

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje: 'Error en login'

    });

  }

};