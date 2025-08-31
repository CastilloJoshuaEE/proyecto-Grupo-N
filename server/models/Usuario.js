const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  correo: {
    type: String,
    required: true,
    unique: true
  },
  contrasena: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  cedula: {
    type: String,
    required: true,
    unique: true
  },
  telefono: String,
  direccion: String,
  tipo: {
    type: String,
    enum: ['cliente', 'admin', 'bodeguero'],
    default: 'cliente'
  },
  cuenta_activa: {
    type: Boolean,
    default: true
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
});

// Middleware para encriptar contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) return next();
  this.contrasena = await bcrypt.hash(this.contrasena, 12);
  next();
});

// Método para comparar contraseñas
usuarioSchema.methods.validarContrasena = async function(contrasena) {
  return await bcrypt.compare(contrasena, this.contrasena);
};

// Método estático para registrar usuario
usuarioSchema.statics.registrarUsuario = async function(datosUsuario) {
  const { correo, cedula } = datosUsuario;
  
  // Verificar si el correo ya existe
  const existeCorreo = await this.findOne({ correo });
  if (existeCorreo) {
    throw new Error('El correo ya está registrado');
  }
  
  // Verificar si la cédula ya existe
  const existeCedula = await this.findOne({ cedula });
  if (existeCedula) {
    throw new Error('La cédula ya está registrada');
  }
  
  // Asegurar que cuenta_activa sea true por defecto
  const datosUsuarioConCuentaActiva = {
    ...datosUsuario,
    cuenta_activa: true
  };
  
  // Crear usuario
  return this.create(datosUsuarioConCuentaActiva);
};

// Método estático para autenticar usuario
usuarioSchema.statics.autenticar = async function(correo, contrasena) {
  const usuario = await this.findOne({ correo });
  
  if (!usuario) {
    throw new Error('Credenciales incorrectas');
  }
  
  // Verificar si la cuenta está activa
  if (!usuario.cuenta_activa) {
    throw new Error('Cuenta desactivada. Contacte al administrador');
  }
  
  const contrasenaValida = await usuario.validarContrasena(contrasena);
  if (!contrasenaValida) {
    throw new Error('Credenciales incorrectas');
  }
  
  return usuario;
};

module.exports = mongoose.model('Usuario', usuarioSchema);