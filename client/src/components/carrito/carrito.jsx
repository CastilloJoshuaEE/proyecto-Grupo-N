import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { toast } from 'react-hot-toast';
import '../../assets/css/carrito.css';

const Carrito = () => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();
  const { carrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    setCargando(false);
  }, [usuario, navigate]);

  const handleActualizarCantidad = async (idItem, nuevaCantidad) => {
    try {
      await actualizarCantidad(idItem, nuevaCantidad);
      toast.success('Cantidad actualizada');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEliminarItem = async (idItem) => {
    if (!window.confirm('¿Eliminar este producto del carrito?')) {
      return;
    }

    try {
      await eliminarDelCarrito(idItem);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleVaciarCarrito = async () => {
    if (!window.confirm('¿Vaciar todo el carrito?')) {
      return;
    }

    try {
      await vaciarCarrito();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (cargando) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Carrito de compras</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="contenedor-carrito">
        {carrito.items.length === 0 ? (
          <div className="text-center">
            <p className="text-muted">Tu carrito está vacío</p>
            <Button variant="primary" onClick={() => navigate('/catalogo')}>
              Ir al catálogo
            </Button>
          </div>
        ) : (
          <>
            <div className="factura-carrito">
              <Table responsive className="tabla-factura">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Color</th>
                    <th>Talla</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.items.map((item) => (
                    <tr key={item._id}>
                      <td data-label="Producto">{item.id_gorra?.nombre}</td>
                      <td data-label="Color">{item.id_gorra?.color}</td>
                      <td data-label="Talla">{item.id_gorra?.talla}</td>
                      <td data-label="Precio">${item.precio_unitario?.toFixed(2)}</td>
                      <td data-label="Cantidad">
                        <Form.Control
                          type="number"
                          name="cantidad"
                          defaultValue={item.cantidad}
                          min="1"
                          max={item.id_gorra?.stock}
                          style={{ width: '70px' }}
                          onChange={(e) => {
                            const cantidad = parseInt(e.target.value);
                            if (cantidad >= 1 && cantidad <= item.id_gorra?.stock) {
                              handleActualizarCantidad(item._id, cantidad);
                            }
                          }}
                        />
                      </td>
                      <td data-label="Total">${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                      <td data-label="Acciones">
                        <div className="d-flex gap-2">
                          {/* 
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              const form = document.querySelector(`form[data-item="${item._id}"]`);
                              const cantidad = parseInt(form?.querySelector('input[name="cantidad"]')?.value || item.cantidad);
                              handleActualizarCantidad(item._id, cantidad);
                            }}
                          >
                            Actualizar
                          </Button>
                          */}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminarItem(item._id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-end fw-bold">Subtotals</td>
                    <td className="fw-bold">${carrito.subtotal?.toFixed(2) || '0.00'}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="text-end">IVA (15%):</td>
                    <td>${carrito.iva?.toFixed(2) || '0.00'}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="text-end">Transporte:</td>
                    <td>Gratis</td>
                    <td></td>
                  </tr>
                  <tr className="total">
                    <td colSpan="5" className="text-end fw-bold">Total a pagar:</td>
                    <td className="fw-bold">${carrito.total?.toFixed(2) || '0.00'}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>

            <div className="acciones-carrito mt-4">
              <Row>
                <Col className="d-flex justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/catalogo')}
                  >
                    ← Seguir comprando
                  </Button>
                  <div>
                    <Button
                      variant="outline-danger"
                      onClick={handleVaciarCarrito}
                      className="me-2"
                    >
                      Vaciar carrito
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/finalizar-compra')}
                    >
                      Continuar al pago
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export default Carrito;