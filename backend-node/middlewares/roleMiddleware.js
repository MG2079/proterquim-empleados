
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // Confirmar que el middleware de autenticación se ejecutó
      if (!req.usuario) {
        return res.status(401).json({
          mensaje: 'Usuario no autenticado'
        });
      }

      // Confirmar que el rol actual esté autorizado
      const rolUsuario = req.usuario.rol;

      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          mensaje: 'No tienes permisos para acceder'
        });
      }

      return next();
    } catch (error) {
      console.error('Error al validar el rol:', error);

      return res.status(500).json({
        mensaje: 'Error de validación de roles'
      });
    }
  };
};

module.exports = verificarRol;
