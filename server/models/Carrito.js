const mongoose = require('mongoose');

const itemCarritoSchema = new mongoose.Schema({
  id_gorra: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gorra',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precio_unitario: {
    type: Number,
    required: true
  },
  fecha_agregado: {
    type: Date,
    default: Date.now
  }
});

const carritoSchema = new mongoose.Schema({
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  items: [itemCarritoSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  iva: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  estado: {
    type: String,
    enum: ['activo', 'comprado', 'abandonado'],
    default: 'activo'
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar fecha de modificación
carritoSchema.pre('save', function(next) {
  this.fecha_actualizacion = Date.now();
  next();
});

// Método para calcular el total del carrito
carritoSchema.methods.calcularTotal = function() {
  const subtotal = this.items.reduce((total, item) => {
    return total + (item.precio_unitario * item.cantidad);
  }, 0);
  
  const iva = subtotal * 0.15; // IVA del 15%
  const total = subtotal + iva;
  
  return { subtotal, iva, total };
};

carritoSchema.methods.agregarItem = async function(idGorra, cantidad = 1) {
  const Gorra = mongoose.model('Gorra');
  const gorra = await Gorra.findById(idGorra);
  
  if (!gorra) {
    throw new Error('Gorra no encontrada');
  }
  
  if (!gorra.estaDisponible(cantidad)) {
    throw new Error('Stock insuficiente');
  }
  
  // Convertir el ID a string para comparación consistente
  const idGorraStr = idGorra.toString();
  
  // Verificar si ya existe en el carrito (mismo producto)
  const itemIndex = this.items.findIndex(item => {
    // Si el item tiene la gorra populada, comparar el _id
    if (item.id_gorra._id) {
      return item.id_gorra._id.toString() === idGorraStr;
    }
    // Si no está populado, comparar directamente el ObjectId convertido a string
    return item.id_gorra.toString() === idGorraStr;
  });
  
  console.log(`Buscando producto ${idGorraStr} en carrito. Encontrado en índice: ${itemIndex}`);
  
  if (itemIndex > -1) {
    // Actualizar cantidad si ya existe
    this.items[itemIndex].cantidad += cantidad;
    console.log(`Producto existente, nueva cantidad: ${this.items[itemIndex].cantidad}`);
  } else {
    // Agregar nuevo item
    this.items.push({
      id_gorra: idGorra,
      cantidad: cantidad,
      precio_unitario: gorra.precio
    });
    console.log('Nuevo producto agregado al carrito');
  }
  
  // Actualizar los totales del carrito
  const { subtotal, iva, total } = this.calcularTotal();
  this.subtotal = subtotal;
  this.iva = iva;
  this.total = total;
  
  return this.save();
};
// Método para actualizar cantidad de un item
carritoSchema.methods.actualizarCantidadItem = async function(idItem, cantidad) {
  const item = this.items.id(idItem);
  if (!item) {
    throw new Error('Item no encontrado en el carrito');
  }
  
  const Gorra = mongoose.model('Gorra');
  const gorra = await Gorra.findById(item.id_gorra);
  
  if (!gorra || !gorra.estaDisponible(cantidad)) {
    throw new Error('Stock insuficiente');
  }
  
  item.cantidad = cantidad;
  const { subtotal, iva, total } = this.calcularTotal();
  this.subtotal = subtotal;
  this.iva = iva;
  this.total = total;
  
  return this.save();
};

// Método para eliminar item del carrito
carritoSchema.methods.eliminarItem = function(idItem) {
  // Encontrar el índice del item
  const itemIndex = this.items.findIndex(item => item._id.toString() === idItem.toString());
  
  if (itemIndex === -1) {
    throw new Error('Item no encontrado en el carrito');
  }
  
  // Eliminar el item
  this.items.splice(itemIndex, 1);
  
  // Recalcular totales
  const { subtotal, iva, total } = this.calcularTotal();
  this.subtotal = subtotal;
  this.iva = iva;
  this.total = total;
  
  return this.save();
};

// Método para vaciar el carrito
exports.vaciarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.obtenerCarritoUsuario(req.usuario._id);
    
    // Vaciar completamente el carrito
    carrito.items = [];
    carrito.subtotal = 0;
    carrito.iva = 0;
    carrito.total = 0;
    carrito.estado = 'activo'; 
    
    await carrito.save();
    
    res.json({
      success: true,
      message: 'Carrito vaciado',
      data: carrito
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
carritoSchema.methods.vaciar = function() {
  this.items = [];
  this.subtotal = 0;
  this.iva = 0;
  this.total = 0;
  this.estado = 'activo'; 
  return this.save();
};
// Método estático para obtener o crear carrito de usuario
carritoSchema.statics.obtenerCarritoUsuario = async function(idUsuario) {
  try {
    // Buscar carrito por ID de usuario
    let carrito = await this.findOne({ 
      id_usuario: idUsuario 
    }).populate('items.id_gorra');
    
    if (!carrito) {
      // Si no existe, crear uno nuevo
      carrito = await this.create({ 
        id_usuario: idUsuario,
        items: [],
        subtotal: 0,
        iva: 0,
        total: 0,
        estado: 'activo'
      });
      
      console.log('Nuevo carrito creado para usuario:', idUsuario);
    }
    
    return carrito;
  } catch (error) {
    console.error('Error en obtenerCarritoUsuario:', error);
    throw error;
  }
};

module.exports = mongoose.model('Carrito', carritoSchema);