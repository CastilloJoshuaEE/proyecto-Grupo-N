const Usuario = require('../models/Usuario');
exports.cambiarContrasena = async (req, res) => {
  try {
    const { correo, nueva_contrasena, confirmar_contrasena } = req.body;
    
    // Validar que las contraseñas coincidan
    if (nueva_contrasena !== confirmar_contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }
    
    // Validar longitud mínima de contraseña
    if (nueva_contrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ correo });
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar contraseña
    usuario.contrasena = nueva_contrasena;
    await usuario.save();
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.recuperarContrasena = async (req, res) => {
  try {
    const { correo, nueva_contrasena, confirmar_contrasena } = req.body;
    
    // Validar que las contraseñas coincidan
    if (nueva_contrasena !== confirmar_contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }
    
    // Validar longitud mínima de contraseña
    if (nueva_contrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ correo });
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar contraseña
    usuario.contrasena = nueva_contrasena;
    await usuario.save();
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// Obtener perfil de usuario
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id).select('-contrasena');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar perfil de usuario
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, telefono, direccion } = req.body;
    
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      { nombre, apellido, telefono, direccion },
      { new: true, runValidators: true }
    ).select('-contrasena');
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: usuario
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Agregar método para desactivar cuenta
exports.desactivarCuenta = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      { cuenta_activa: false },
      { new: true }
    ).select('-contrasena');
    
    res.json({
      success: true,
      message: 'Cuenta desactivada exitosamente',
      data: usuario
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};