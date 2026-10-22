
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const ROLES_SOLICITABLES = [
  'Gerente',
  'Administrador',
  'Contador',
  'Empleado'
];

const ROLES_GESTORES = [
  'Desarrollador',
  'Administrador',
  'Gerente'
];

// ==========================================
// CONFIGURACIÓN DEL CORREO SMTP
// ==========================================

function crearTransportadorCorreo() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure:
      String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
}

// ==========================================
// REGISTRO PÚBLICO
// ==========================================

exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rolSolicitado } = req.body;

    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return res.status(400).json({
        mensaje:
          'Ingresa nombre, correo y una contraseña de al menos 8 caracteres.'
      });
    }

    if (!ROLES_SOLICITABLES.includes(rolSolicitado)) {
      return res.status(400).json({
        mensaje: 'El rol solicitado no es válido.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        mensaje: 'El servicio de autenticación no está configurado.'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExiste = await Usuario.findOne({
      email: emailNormalizado
    });

    if (usuarioExiste) {
      return res.status(400).json({
        mensaje: 'No se pudo registrar la solicitud con esos datos.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre: nombre.trim(),
      email: emailNormalizado,
      password: passwordHash,
      rol: 'Empleado',
      rolSolicitado,
      activo: false,
      estadoAprobacion: 'pendiente',
      aprobadoPor: null,
      fechaAprobacion: null
    });

    await nuevoUsuario.save();

    return res.status(201).json({
      mensaje:
        'Solicitud recibida. Podrás iniciar sesión cuando sea aprobada.'
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: 'No se pudo registrar la solicitud con esos datos.'
      });
    }

    return res.status(500).json({
      mensaje: 'Error al procesar la solicitud de registro.'
    });
  }
};

// ==========================================
// INICIO DE SESIÓN
// ==========================================

exports.login = async (req, res) => {
  console.log('[LOGIN] Solicitud recibida');

  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        mensaje: 'Debes ingresar correo y contraseña.'
      });
    }

    console.log('[LOGIN] Buscando usuario en MongoDB');

    const usuario = await Usuario.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    console.log('[LOGIN] Consulta finalizada');

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      });
    }

    if (usuario.activo === false) {
      return res.status(403).json({
        mensaje:
          usuario.estadoAprobacion === 'rechazado'
            ? 'Tu solicitud de acceso no fue aprobada.'
            : 'Tu cuenta está pendiente de aprobación o inactiva.'
      });
    }

    if (
      usuario.estadoAprobacion &&
      usuario.estadoAprobacion !== 'aprobado'
    ) {
      return res.status(403).json({
        mensaje: 'Tu cuenta no está aprobada para iniciar sesión.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        mensaje: 'El servicio de autenticación no está configurado.'
      });
    }

    const token = jwt.sign(
      { id: usuario._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
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
    console.error('[LOGIN] Error:', error);

    return res.status(500).json({
      mensaje: 'Error en el inicio de sesión.'
    });
  }
};

// ==========================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ==========================================

exports.solicitarRecuperacion = async (req, res) => {
  console.log('[RECUPERACION] Solicitud recibida');

  const respuestaGenerica = {
    mensaje:
      'Si el correo corresponde a una cuenta registrada, recibirás instrucciones para restablecer tu contraseña.'
  };

  try {
    const { email } = req.body;

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(200).json(respuestaGenerica);
    }

    console.log('[RECUPERACION] Buscando usuario en MongoDB');

    const usuario = await Usuario.findOne({
      email: email.trim().toLowerCase()
    });

    console.log('[RECUPERACION] Consulta de usuario finalizada');

    // No revelar si el correo está registrado.
    if (!usuario) {
      return res.status(200).json(respuestaGenerica);
    }

    const transportador = crearTransportadorCorreo();
    const frontendUrl = process.env.FRONTEND_URL;

    if (!transportador || !frontendUrl) {
      console.error(
        '[RECUPERACION] Faltan variables SMTP o FRONTEND_URL.'
      );

      return res.status(200).json(respuestaGenerica);
    }

    const token = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    usuario.tokenRecuperacion = tokenHash;
    usuario.expiracionTokenRecuperacion =
      new Date(Date.now() + 15 * 60 * 1000);

    console.log('[RECUPERACION] Guardando token');

    await usuario.save();

    console.log('[RECUPERACION] Token guardado');

    const baseUrl = frontendUrl.replace(/\/+$/, '');

    const enlace =
      `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const nombreSeguro = String(usuario.nombre).replace(
      /[&<>"']/g,
      caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[caracter]
    );

    try {
      console.log('[RECUPERACION] Iniciando envío SMTP');

      await transportador.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: usuario.email,
        subject: 'Restablecer contraseña - ProterquimERP',

        text:
          `Hola ${usuario.nombre}.\n\n` +
          'Recibimos una solicitud para restablecer tu contraseña.\n\n' +
          `Abre este enlace: ${enlace}\n\n` +
          'El enlace vence en 15 minutos y solo puede utilizarse una vez.\n\n' +
          'Si no solicitaste este cambio, ignora este mensaje.',

        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#263248">
            <h2 style="color:#3CA0F2">ProterquimERP</h2>
            <p>Hola, ${nombreSeguro}.</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>
              <a
                href="${enlace}"
                style="display:inline-block;padding:12px 20px;background:#3CA0F2;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold"
              >
                Restablecer contraseña
              </a>
            </p>
            <p>El enlace vence en 15 minutos y solo puede utilizarse una vez.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          </div>
        `
      });

      console.log('[RECUPERACION] Envío SMTP finalizado');
      console.log('Correo de recuperación enviado correctamente.');
    } catch (errorCorreo) {
      usuario.tokenRecuperacion = null;
      usuario.expiracionTokenRecuperacion = null;

      await usuario.save();

      console.error(
        '[RECUPERACION] Error al enviar correo:',
        errorCorreo.message
      );
    }

    return res.status(200).json(respuestaGenerica);
  } catch (error) {
    console.error('[RECUPERACION] Error:', error);

    return res.status(200).json(respuestaGenerica);
  }
};

// ==========================================
// RESTABLECER CONTRASEÑA
// ==========================================

exports.restablecerPassword = async (req, res) => {
  console.log('[RESTABLECER] Solicitud recibida');

  try {
    const { token, password } = req.body;

    if (
      typeof token !== 'string' ||
      !token.trim() ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return res.status(400).json({
        mensaje:
          'Ingresa un enlace válido y una contraseña de al menos 8 caracteres.'
      });
    }

    console.log('[RESTABLECER] Calculando hash del token');

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const filtroToken = {
      tokenRecuperacion: tokenHash,
      expiracionTokenRecuperacion: { $gt: new Date() }
    };

    console.log('[RESTABLECER] Buscando token en MongoDB');

    const usuario = await Usuario.findOne(filtroToken);

    console.log('[RESTABLECER] Consulta de token finalizada');

    if (!usuario) {
      return res.status(400).json({
        mensaje:
          'El enlace es inválido, venció o ya fue utilizado. Solicita uno nuevo.'
      });
    }

    console.log('[RESTABLECER] Calculando hash de contraseña');

    const passwordHash = await bcrypt.hash(password, 10);

    console.log('[RESTABLECER] Actualizando contraseña en MongoDB');

    const actualizado = await Usuario.findOneAndUpdate(
      {
        _id: usuario._id,
        ...filtroToken
      },
      {
        $set: {
          password: passwordHash,
          tokenRecuperacion: null,
          expiracionTokenRecuperacion: null
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    console.log('[RESTABLECER] Actualización finalizada');

    if (!actualizado) {
      return res.status(400).json({
        mensaje:
          'El enlace es inválido o ya fue utilizado. Solicita uno nuevo.'
      });
    }

    console.log('[RESTABLECER] Contraseña restablecida correctamente');

    return res.status(200).json({
      mensaje:
        'Contraseña restablecida correctamente. Ya puedes iniciar sesión.'
    });
  } catch (error) {
    console.error('[RESTABLECER] Error:', error);

    return res.status(500).json({
      mensaje: 'No fue posible restablecer la contraseña.'
    });
  }
};

// ==========================================
// CONSULTAR SOLICITUDES PENDIENTES
// ==========================================

exports.obtenerPendientes = async (req, res) => {
  try {
    if (!ROLES_GESTORES.includes(req.usuario?.rol)) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para consultar solicitudes.'
      });
    }

    const solicitudes = await Usuario.find({
      estadoAprobacion: 'pendiente'
    })
      .select('_id nombre email rolSolicitado createdAt')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(solicitudes);
  } catch (error) {
    console.error('Error al consultar solicitudes:', error);

    return res.status(500).json({
      mensaje: 'Error al consultar las solicitudes pendientes.'
    });
  }
};

// ==========================================
// APROBAR O RECHAZAR SOLICITUD
// ==========================================

exports.resolverSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, rol } = req.body;
    const gestor = req.usuario;

    if (!ROLES_GESTORES.includes(gestor?.rol)) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para resolver solicitudes.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensaje: 'El identificador de la solicitud no es válido.'
      });
    }

    if (!['aprobar', 'rechazar'].includes(decision)) {
      return res.status(400).json({
        mensaje: 'La decisión debe ser aprobar o rechazar.'
      });
    }

    if (
      decision === 'aprobar' &&
      !ROLES_SOLICITABLES.includes(rol)
    ) {
      return res.status(400).json({
        mensaje: 'El rol asignado no es válido.'
      });
    }

    if (id === String(gestor.id || gestor._id)) {
      return res.status(403).json({
        mensaje: 'No puedes resolver tu propia solicitud.'
      });
    }

    const cambios = {
      estadoAprobacion:
        decision === 'aprobar' ? 'aprobado' : 'rechazado',
      activo: decision === 'aprobar',
      aprobadoPor: gestor.id || gestor._id,
      fechaAprobacion: new Date()
    };

    if (decision === 'aprobar') {
      cambios.rol = rol;
    }

    const solicitud = await Usuario.findOneAndUpdate(
      {
        _id: id,
        estadoAprobacion: 'pendiente'
      },
      {
        $set: cambios
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!solicitud) {
      const existente = await Usuario.findById(id)
        .select('_id estadoAprobacion')
        .lean();

      if (!existente) {
        return res.status(404).json({
          mensaje: 'No se encontró la solicitud.'
        });
      }

      return res.status(409).json({
        mensaje: 'Esta solicitud ya fue resuelta.'
      });
    }

    return res.status(200).json({
      mensaje:
        decision === 'aprobar'
          ? `Solicitud aprobada correctamente. Rol asignado: ${solicitud.rol}.`
          : 'Solicitud rechazada correctamente.'
    });
  } catch (error) {
    console.error('Error al resolver solicitud:', error);

    return res.status(500).json({
      mensaje: 'Error al resolver la solicitud.'
    });
  }
};
