const Venta = require('../models/VentaModelo');
const Usuario = require('../models/Usuario');
// Obtener todas las ventas (admin)
exports.obtenerTodasVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estado, metodo_pago } = req.query;
    
    const ventas = await Venta.obtenerTodasVentas({
      fecha_inicio,
      fecha_fin,
      estado,
      metodo_pago
    });
    
    res.json({
      success: true,
      count: ventas.length,
      data: ventas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener reporte de ventas (admin)
exports.obtenerReporteVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const matchStage = {};
    if (fecha_inicio || fecha_fin) {
      matchStage.fecha_venta = {};
      if (fecha_inicio) matchStage.fecha_venta.$gte = new Date(fecha_inicio);
      if (fecha_fin) matchStage.fecha_venta.$lte = new Date(fecha_fin);
    }
    
    // Obtener todas las ventas en el período
    const ventas = await Venta.find(matchStage);
    
    // Calcular estadísticas
    const montos = ventas.map(v => v.total);
    const totalVentas = montos.reduce((sum, monto) => sum + monto, 0);
    
    // Calcular media
    const media = montos.length > 0 ? totalVentas / montos.length : 0;
    
    // Calcular mediana
    let mediana = 0;
    if (montos.length > 0) {
      const sorted = [...montos].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      mediana = sorted.length % 2 === 0 
        ? (sorted[middle - 1] + sorted[middle]) / 2 
        : sorted[middle];
    }
    
    // Calcular moda
    let moda = 0;
    if (montos.length > 0) {
      const frequency = {};
      let maxFreq = 0;
      
      montos.forEach(monto => {
        frequency[monto] = (frequency[monto] || 0) + 1;
        if (frequency[monto] > maxFreq) {
          maxFreq = frequency[monto];
          moda = monto;
        }
      });
    }
    
    // Calcular ventas por día
    const ventasPorDia = {};
    ventas.forEach(venta => {
      const fecha = venta.fecha_venta.toISOString().split('T')[0];
      ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + venta.total;
    });
    
    // Calcular ventas por método de pago
    const ventasPorMetodo = {
      efectivo: 0,
      transferencia: 0
    };
    
    ventas.forEach(venta => {
      if (venta.metodo_pago === 'efectivo') {
        ventasPorMetodo.efectivo += venta.total;
      } else if (venta.metodo_pago === 'transferencia') {
        ventasPorMetodo.transferencia += venta.total;
      }
    });
    
    res.json({
      success: true,
      data: {
        total_ventas: totalVentas,
        media: media,
        mediana: mediana,
        moda: moda,
        ventas_por_dia: ventasPorDia,
        ventas_por_metodo: ventasPorMetodo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.obtenerProductosMasVendidos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, limite } = req.query;
    
    const matchStage = { estado: 'completada' }; // Solo ventas completadas
    if (fecha_inicio || fecha_fin) {
      matchStage.fecha_venta = {};
      if (fecha_inicio) matchStage.fecha_venta.$gte = new Date(fecha_inicio);
      if (fecha_fin) matchStage.fecha_venta.$lte = new Date(fecha_fin);
    }
    
    const productosMasVendidos = await Venta.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      // Agregar lookup para obtener información de la gorra
      {
        $lookup: {
          from: 'gorras',
          localField: 'items.id_gorra',
          foreignField: '_id',
          as: 'gorra_info'
        }
      },
      { $unwind: '$gorra_info' },
      {
        $group: {
          _id: '$items.id_gorra',
          nombre: { $first: '$items.nombre' },
          tipo: { $first: '$gorra_info.tipo' }, // Obtener el tipo de la gorra
          cantidadVendida: { $sum: '$items.cantidad' },
          totalVendido: { $sum: { $multiply: ['$items.cantidad', '$items.precio_unitario'] } }
        }
      },
      { $sort: { cantidadVendida: -1 } },
      { $limit: parseInt(limite) || 10 }
    ]);
    
    res.json({
      success: true,
      data: productosMasVendidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.obtenerTodosUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena');
    
    res.json({
      success: true,
      count: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener usuario por ID (admin)
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-contrasena');
    
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

// Actualizar usuario (admin)
exports.actualizarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, telefono, direccion, tipo, cuenta_activa } = req.body;
    
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, telefono, direccion, tipo, cuenta_activa },
      { new: true, runValidators: true }
    ).select('-contrasena');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuario
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};