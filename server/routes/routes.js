require('dotenv').config();
const express = require('express');
const router = express.Router();
const { proteger, autorizar } = require('../middleware/auth');

// Importar controladores
const authController = require('../controllers/authController');
const gorraController = require('../controllers/gorraController');
const carritoController = require('../controllers/carritoController');
const ventaController = require('../controllers/VentaController');
const administradorController = require('../controllers/administradorController');
const usuariosController = require('../controllers/usuariosController');

// ==================== RUTAS PÚBLICAS ====================

// Auth routes
router.post('/usuarios/registro', authController.registrar);
router.post('/usuarios/login', authController.login);

// Gorra routes
router.get('/gorras/destacadas', gorraController.obtenerGorrasDestacadas); 
router.get('/gorras', gorraController.obtenerGorras); 
router.get('/gorras/:id', gorraController.obtenerGorraPorId);
// ==================== RUTAS PROTEGIDAS ====================

// Usuario routes
router.post('/usuarios/cambiar-contrasena', usuariosController.cambiarContrasena);
router.post('/usuarios/recuperar-contrasena', usuariosController.recuperarContrasena);

router.get('/usuario/perfil', proteger, usuariosController.obtenerPerfil);
router.put('/usuario/perfil', proteger, usuariosController.actualizarPerfil);
router.put('/usuario/desactivar-cuenta', proteger, usuariosController.desactivarCuenta);
// Carrito routes
router.get('/carrito', proteger, carritoController.obtenerCarrito);
router.post('/carrito/items', proteger, carritoController.agregarItem);
router.put('/carrito/items/:idItem', proteger, carritoController.actualizarCantidadItem);
router.delete('/carrito/items/:idItem', proteger, carritoController.eliminarItem);
router.delete('/carrito', proteger, carritoController.vaciarCarrito);

// Venta routes
router.post('/compras/finalizar', proteger, ventaController.finalizarCompra);
router.get('/compras/historial', proteger, ventaController.obtenerHistorialCompras);
router.get('/compras/:id', proteger, ventaController.obtenerDetalleCompra);

// ==================== RUTAS DE ADMINISTRACIÓN ====================

// Gorra admin routes
router.post('/admin/gorras', proteger, autorizar('admin', 'bodeguero'), gorraController.subirImagen, gorraController.crearGorra);
router.put('/admin/gorras/:id', proteger, autorizar('admin', 'bodeguero'), gorraController.subirImagen, gorraController.actualizarGorra);
router.delete('/admin/gorras/:id', proteger, autorizar('admin'), gorraController.eliminarGorra);

// Admin routes
router.get('/admin/ventas', proteger, autorizar('admin'), administradorController.obtenerTodasVentas);
router.get('/admin/reportes/ventas', proteger, autorizar('admin'), administradorController.obtenerReporteVentas);
router.get('/admin/reportes/productos-mas-vendidos', proteger, autorizar('admin'), administradorController.obtenerProductosMasVendidos);
router.get('/admin/clientes', proteger, autorizar('admin'), administradorController.obtenerTodosUsuarios);
router.get('/admin/clientes/:id', proteger, autorizar('admin'), administradorController.obtenerUsuarioPorId);
router.put('/admin/clientes/:id', proteger, autorizar('admin'), administradorController.actualizarUsuario);
module.exports = router;