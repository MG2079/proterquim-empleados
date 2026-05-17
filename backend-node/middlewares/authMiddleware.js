const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {

  try {

    // 🔐 OBTENER HEADER

    const authHeader =
      req.headers.authorization;

    // ❌ SI NO EXISTE TOKEN

    if (!authHeader) {

      return res.status(401).json({
        mensaje: 'Token no proporcionado'
      });

    }

    // 🔥 FORMATO:
    // Bearer TOKEN

    const token =
      authHeader.split(' ')[1];

    // ✅ VALIDAR TOKEN

    const decoded = jwt.verify(

      token,

      process.env.JWT_SECRET

    );

    // 👤 GUARDAR USUARIO

    req.usuario = decoded;

    next();

  } catch (error) {

    console.log(error);

    return res.status(401).json({

      mensaje: 'Token inválido'

    });

  }

};

module.exports = verificarToken;