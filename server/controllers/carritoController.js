const Carrito = require('../models/Carrito');

// Obtener carrito del usuario
exports.obtenerCarrito = async (req, res) => {
  try {
    console.log('Usuario autenticado ID:', req.usuario._id); 
    const carrito = await Carrito.obtenerCarritoUsuario(req.usuario._id);
    
    // Siempre calcular totales, incluso si el carrito está vacío
    const { subtotal, iva, total } = carrito.calcularTotal();
    carrito.subtotal = subtotal;
    carrito.iva = iva;
    carrito.total = total;
    
    // Solo guardar si hay cambios reales
    const necesitaGuardar = carrito.subtotal !== subtotal || 
                           carrito.iva !== iva || 
                           carrito.total !== total;
    
    if (necesitaGuardar) {
      await carrito.save();
    }
    
    // Asegurar que los items estén populados
    await carrito.populate('items.id_gorra');

    console.log('Carrito encontrado:', carrito);
    
    res.json({
      success: true,
      data: carrito
    });
  } catch (error) {
    console.error('Error en obtenerCarrito:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Agregar item al carrito
exports.agregarItem = async (req, res) => {
  try {
    const { id_gorra, cantidad } = req.body;
    
    const carrito = await Carrito.obtenerCarritoUsuario(req.usuario._id);
    await carrito.agregarItem(id_gorra, cantidad || 1);
    
    // Volver a cargar el carrito con la información actualizada
    const carritoActualizado = await Carrito.findById(carrito._id)
      .populate('items.id_gorra');
    
    res.json({
      success: true,
      message: 'Producto agregado al carrito',
      data: carritoActualizado
    });
  } catch (error) {
    console.error('Error en agregarItem:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar cantidad de item en carrito
exports.actualizarCantidadItem = async (req, res) => {
  try {
    const { cantidad } = req.body;
    
    const carrito = await Carrito.obtenerCarritoUsuario(req.usuario._id);
    await carrito.actualizarCantidadItem(req.params.idItem, cantidad);
    
    await carrito.populate('items.id_gorra');
    
    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: carrito
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Eliminar item del carrito
exports.eliminarItem = async (req, res) => {
  try {
    const carrito = await Carrito.obtenerCarritoUsuario(req.usuario._id);
    
    // Buscar el item por su ID
    const item = carrito.items.id(req.params.idItem);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito'
      });
    }
    
    await carrito.eliminarItem(req.params.idItem);
    
    await carrito.populate('items.id_gorra');
    
    res.json({
      success: true,
      message: 'Item eliminado del carrito',
      data: carrito
    });
  } catch (error) {
    console.error('Error en eliminarItem:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Vaciar carrito
exports.vaciarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.obtenerCarritoUsuario(req.usuario._id);
    await carrito.vaciar();
    
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