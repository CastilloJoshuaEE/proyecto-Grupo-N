const Venta = require('../models/VentaModelo');

// Finalizar compra
exports.finalizarCompra = async (req, res) => {
  try {
    const { metodo_pago, datos_transferencia } = req.body;
    
    const venta = await Venta.crearVenta(
      req.usuario._id, 
      metodo_pago, 
      datos_transferencia
    );
    
    await venta.populate('id_usuario', 'nombre apellido cedula correo');
    
    res.status(201).json({
      success: true,
      message: 'Compra realizada exitosamente',
      data: venta
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener historial de compras del usuario
exports.obtenerHistorialCompras = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estado } = req.query;
    
    const ventas = await Venta.obtenerVentasUsuario(req.usuario._id, {
      fecha_inicio,
      fecha_fin,
      estado
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

// Obtener detalle de una compra
exports.obtenerDetalleCompra = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('id_usuario', 'nombre apellido cedula correo');
    
    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }
    
    // Verificar que el usuario es el propietario o es admin
    if (venta.id_usuario._id.toString() !== req.usuario._id.toString() && 
        req.usuario.tipo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver esta venta'
      });
    }
    
    res.json({
      success: true,
      data: venta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};