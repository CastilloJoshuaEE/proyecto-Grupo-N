const Gorra = require('../models/Gorra');
const multer = require('multer');
const path = require('path');

// Configurar multer para almacenamiento - RUTA CORREGIDA
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Usar path absoluto desde la raíz del proyecto
    cb(null, path.join(__dirname, '../../client/public/img'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gorra-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Middleware para subir imagen
exports.subirImagen = upload.single('imagen');
// Obtener todas las gorras disponibles
exports.obtenerGorras = async (req, res) => {
  try {
    const { tipo, talla, color, precio_min, precio_max, busqueda, disponible } = req.query;
    const filtroDisponible = disponible === 'all' ? undefined : true;

    const gorras = await Gorra.buscarGorras({
      tipo,
      talla,
      color,
      precio_min,
      precio_max,
      disponible: filtroDisponible,
      busqueda
    });
    
    res.json({
      success: true,
      count: gorras.length,
      data: gorras
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener una gorra por ID
exports.obtenerGorraPorId = async (req, res) => {
  try {
    const gorra = await Gorra.findById(req.params.id);
    
    if (!gorra) {
      return res.status(404).json({
        success: false,
        message: 'Gorra no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: gorra
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.crearGorra = async (req, res) => {
  try {
    let gorraData = req.body;
    
    // Si hay una imagen subida, guardar la ruta
    if (req.file) {
      gorraData.imagen = '/img/' + req.file.filename;
    }

    // Convertir tipos numéricos
    if (gorraData.precio) gorraData.precio = parseFloat(gorraData.precio);
    if (gorraData.stock) gorraData.stock = parseInt(gorraData.stock);
    if (gorraData.disponible) {
      gorraData.disponible = gorraData.disponible === 'true' || gorraData.disponible === true;
    }

    const gorra = await Gorra.create(gorraData);
    
    res.status(201).json({
      success: true,
      message: 'Gorra creada exitosamente',
      data: gorra
    });
  } catch (error) {
    console.error('Error al crear gorra:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// Actualizar gorra (admin/bodeguero)

exports.actualizarGorra = async (req, res) => {
  try {
    let gorraData = req.body;
    
    // Si hay una imagen subida, guardar la ruta
    if (req.file) {
      gorraData.imagen = '/img/' + req.file.filename;
    }

    // Convertir tipos numéricos
    if (gorraData.precio) gorraData.precio = parseFloat(gorraData.precio);
    if (gorraData.stock) gorraData.stock = parseInt(gorraData.stock);
    if (gorraData.disponible) gorraData.disponible = gorraData.disponible === 'true';

    const gorra = await Gorra.findByIdAndUpdate(
      req.params.id,
      gorraData,
      { new: true, runValidators: true }
    );
    
    if (!gorra) {
      return res.status(404).json({
        success: false,
        message: 'Gorra no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Gorra actualizada exitosamente',
      data: gorra
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Eliminar gorra (admin)
exports.eliminarGorra = async (req, res) => {
  try {
    const gorra = await Gorra.findByIdAndDelete(req.params.id);
    
    if (!gorra) {
      return res.status(404).json({
        success: false,
        message: 'Gorra no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Gorra eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Obtener gorras destacadas
exports.obtenerGorrasDestacadas = async (req, res) => {
  try {
    const gorras = await Gorra.find({ 
      disponible: true,
      destacada: true 
    })
    .limit(4)
    .sort({ fecha_creacion: -1 });
    
    res.json({
      success: true,
      count: gorras.length,
      data: gorras
    });
  } catch (error) {
    console.error('Error en obtenerGorrasDestacadas:', error); // Agregar log
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};