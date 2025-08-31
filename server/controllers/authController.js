const Usuario = require('../models/Usuario');
const { generarToken } = require('../middleware/auth');

// Registrar nuevo usuario
exports.registrar = async (req, res) => {
  try {
    const usuario = await Usuario.registrarUsuario(req.body);
    
    const token = generarToken(usuario._id);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo: usuario.tipo,
        cuenta_activa: usuario.cuenta_activa,
        token: token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    
    const usuario = await Usuario.autenticar(correo, contrasena);
    
    const token = generarToken(usuario._id);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo: usuario.tipo,
        cuenta_activa: usuario.cuenta_activa,
        token: token
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};