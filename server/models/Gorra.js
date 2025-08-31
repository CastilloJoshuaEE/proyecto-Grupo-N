const mongoose = require('mongoose');
const gorraSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['deportiva', 'elegante', 'casual', 'personalizada'],
    required: true
  },
  talla: {
    type: String,
    enum: ['S', 'M', 'L', 'XL'],
    required: true
  },
  color: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  descripcion: String,
  imagen: String,
  disponible: {
    type: Boolean,
    default: true
  },
  destacada: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    default: 0
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

// Método para verificar disponibilidad
gorraSchema.methods.estaDisponible = function(cantidad = 1) {
  return this.disponible && this.stock >= cantidad;
};

// Método para reducir stock
gorraSchema.methods.reducirStock = function(cantidad) {
  if (this.stock < cantidad) {
    throw new Error('Stock insuficiente');
  }
  this.stock -= cantidad;
  return this.save();
};

// Método para aumentar stock
gorraSchema.methods.aumentarStock = function(cantidad) {
  this.stock += cantidad;
  return this.save();
};

// Método estático para buscar gorras con filtros
gorraSchema.statics.buscarGorras = function(filtros = {}) {
  const {
    tipo,
    talla,
    color,
    precio_min,
    precio_max,
    disponible,
    busqueda
  } = filtros;
  
  let query = {};
  
  if (tipo) query.tipo = tipo;
  if (talla) query.talla = talla;
  if (color) query.color = { $regex: color, $options: 'i' };
  if (precio_min !== undefined || precio_max !== undefined) {
    query.precio = {};
    if (precio_min !== undefined) query.precio.$gte = parseFloat(precio_min);
    if (precio_max !== undefined) query.precio.$lte = parseFloat(precio_max);
  }
  if (disponible !== undefined) query.disponible = disponible;
  if (busqueda) {
    query.$or = [
      { nombre: { $regex: busqueda, $options: 'i' } },
      { descripcion: { $regex: busqueda, $options: 'i' } }
    ];
  }
  
  return this.find(query).sort({ nombre: 1 });
};

module.exports = mongoose.model('Gorra', gorraSchema);