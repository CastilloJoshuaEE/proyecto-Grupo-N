const mongoose = require('mongoose');

const itemVentaSchema = new mongoose.Schema({
  id_gorra: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gorra',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  precio_unitario: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const datosTransferenciaSchema = new mongoose.Schema({
  cuenta_origen: {
    type: String,
    required: true
  },
  cuenta_destino: {
    type: String,
    default: '0123456789'
  },
  referencia: {
    type: String,
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  fecha_transferencia: {
    type: Date,
    required: true
  }
});

const facturaSchema = new mongoose.Schema({
  numero_factura: {
    type: String,
    required: true,
    unique: true
  },
  fecha_emision: {
    type: Date,
    default: Date.now
  },
  subtotal: {
    type: Number,
    required: true
  },
  iva: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const ventaSchema = new mongoose.Schema({
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  id_carrito: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrito',
    required: true
  },
  items: [itemVentaSchema],
  fecha_venta: {
    type: Date,
    default: Date.now
  },
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'completada'
  },
  metodo_pago: {
    type: String,
    enum: ['efectivo', 'transferencia'],
    required: true
  },
  factura: facturaSchema,
  datos_transferencia: datosTransferenciaSchema
});

// Método para calcular totales
ventaSchema.methods.calcularTotales = function() {
  const subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  const iva = subtotal * 0.15; // IVA del 15%
  const total = subtotal + iva;
  
  return { subtotal, iva, total };
};

// Método estático para generar número de factura
ventaSchema.statics.generarNumeroFactura = function() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `FAC-${año}${mes}${dia}-${random}`;
};

// Método estático para generar referencia de transferencia
ventaSchema.statics.generarReferenciaTransferencia = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let referencia = 'TX-';
  
  // Agregar 3 letras aleatorias
  for (let i = 0; i < 3; i++) {
    referencia += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Agregar 6 números aleatorios
  for (let i = 0; i < 6; i++) {
    referencia += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return referencia;
};

// Método estático para crear una venta
ventaSchema.statics.crearVenta = async function(idUsuario, metodoPago, datosTransferencia = null) {
  const Carrito = mongoose.model('Carrito');
  const Gorra = mongoose.model('Gorra');
  const Usuario = mongoose.model('Usuario');
  const usuario = await Usuario.findById(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  // Obtener carrito activo del usuario
  const carrito = await Carrito.findOne({ 
    id_usuario: idUsuario, 
    estado: 'activo' 
  }).populate('items.id_gorra');
  
  if (!carrito || carrito.items.length === 0) {
    throw new Error('Carrito vacío o no encontrado');
  }
  if (carrito.estado !== 'activo') {
    throw new Error('El carrito ya fue procesado en una compra anterior');
  }
  // Verificar stock de todos los items
  for (const item of carrito.items) {
    const gorra = await Gorra.findById(item.id_gorra._id);
    if (!gorra.estaDisponible(item.cantidad)) {
      throw new Error(`Stock insuficiente para ${gorra.nombre}`);
    }
  }
  
  // Crear items de venta
  const itemsVenta = carrito.items.map(item => ({
    id_gorra: item.id_gorra._id,
    nombre: item.id_gorra.nombre,
    tipo: item.id_gorra.tipo, 
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.cantidad * item.precio_unitario
  }));
  
  // Calcular totales
  const subtotal = itemsVenta.reduce((sum, item) => sum + item.subtotal, 0);
  const iva = subtotal * 0.15;
  const total = subtotal + iva;
  
  // Generar factura
  const factura = {
    numero_factura: this.generarNumeroFactura(),
    fecha_emision: new Date(),
    subtotal: parseFloat(subtotal.toFixed(2)),
    iva: parseFloat(iva.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
  
  // Preparar datos de transferencia si aplica
  let datosTransferenciaFinal = null;
  if (metodoPago === 'transferencia' && datosTransferencia) {
    datosTransferenciaFinal = {
      cuenta_origen: datosTransferencia.cuenta_origen,
      cuenta_destino: '0123456789',
      referencia: this.generarReferenciaTransferencia(),
      monto: total,
      fecha_transferencia: datosTransferencia.fecha_transferencia || new Date()
    };
  }
  
  try {
    // Reducir stock de productos
    for (const item of carrito.items) {
      await Gorra.findByIdAndUpdate(
        item.id_gorra._id,
        { $inc: { stock: -item.cantidad } }
      );
    }
    
    // Actualizar estado del carrito
    carrito.estado = 'comprado';
    carrito.items = [];
    carrito.subtotal = 0;
    carrito.iva = 0;
    carrito.total = 0;
    await carrito.save();
    
    // Crear la venta
  const venta = new this({
    id_usuario: idUsuario,
    id_carrito: carrito._id,
    items: itemsVenta,
    total,
    metodo_pago: metodoPago,
    factura: factura,
    datos_transferencia: datosTransferenciaFinal,
    // Guardar información del usuario en la venta para fácil acceso
    info_usuario: {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      cedula: usuario.cedula,
      correo: usuario.correo,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      ciudad: usuario.ciudad || 'Guayaquil',
      pais: usuario.pais || 'Ecuador'
    }
  });
    
    await venta.save();
    return venta;
  } catch (error) {
    // Revertir cambios en caso de error
    for (const item of carrito.items) {
      await Gorra.findByIdAndUpdate(
        item.id_gorra._id,
        { $inc: { stock: item.cantidad } }
      );
    }
    throw error;
  }
};
// Método estático para obtener ventas de usuario
ventaSchema.statics.obtenerVentasUsuario = function(idUsuario, filtros = {}) {
  const { fecha_inicio, fecha_fin, estado } = filtros;
  
  let query = { id_usuario: idUsuario };
  
  if (fecha_inicio || fecha_fin) {
    query.fecha_venta = {};
    if (fecha_inicio) query.fecha_venta.$gte = new Date(fecha_inicio);
    if (fecha_fin) query.fecha_venta.$lte = new Date(fecha_fin);
  }
  
  if (estado) query.estado = estado;
  
  return this.find(query)
    .populate('id_usuario', 'nombre apellido cedula correo')
    .sort({ fecha_venta: -1 });
};

// Método estático para obtener todas las ventas (admin)
ventaSchema.statics.obtenerTodasVentas = function(filtros = {}) {
  const { fecha_inicio, fecha_fin, estado, metodo_pago } = filtros;
  
  let query = {};
  
  if (fecha_inicio || fecha_fin) {
    query.fecha_venta = {};
    if (fecha_inicio) query.fecha_venta.$gte = new Date(fecha_inicio);
    if (fecha_fin) query.fecha_venta.$lte = new Date(fecha_fin);
  }
  
  if (estado) query.estado = estado;
  if (metodo_pago) query.metodo_pago = metodo_pago;
  
  return this.find(query)
    .populate('id_usuario', 'nombre apellido cedula correo')
    .sort({ fecha_venta: -1 });
};

module.exports = mongoose.model('Venta', ventaSchema);