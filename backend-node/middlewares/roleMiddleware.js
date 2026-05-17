const verificarRol = (...rolesPermitidos) => {

  return (req, res, next) => {

    try {

      // 🔍 VALIDAR USUARIO

      if (!req.usuario) {

        return res.status(401).json({

          mensaje: 'Usuario no autenticado'

        });

      }

      // 🔍 VALIDAR ROL

      const rolUsuario =
        req.usuario.rol;

      // ❌ SIN PERMISOS

      if (
        !rolesPermitidos.includes(
          rolUsuario
        )
      ) {

        return res.status(403).json({

          mensaje:
            'No tienes permisos para acceder'

        });

      }

      // ✅ CONTINUAR

      next();

    } catch (error) {

      console.log(error);

      res.status(500).json({

        mensaje:
          'Error de validación de roles'

      });

    }

  };

};

module.exports = verificarRol;