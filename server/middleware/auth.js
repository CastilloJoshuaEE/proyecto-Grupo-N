const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Función para generar token JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// middleware/auth.js
exports.proteger = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        mensaje: 'No autorizado, token no proporcionado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario del token
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Token no válido, usuario no existe'
      });
    }

    // Verificar si la cuenta está activa
    if (!usuario.cuenta_activa) {
      return res.status(401).json({
        mensaje: 'Cuenta desactivada. Contacte al administrador'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({
      mensaje: 'No autorizado, token falló'
    });
  }
};

exports.autorizar = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.tipo)) {
      return res.status(403).json({
        mensaje: `Usuario tipo ${req.usuario.tipo} no autorizado para acceder a esta ruta`
      });
    }
    next();
  };
};

// Exportar la función para generar token
exports.generarToken = generarToken;