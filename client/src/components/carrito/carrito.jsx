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
                      <td>{item.id_gorra?.nombre}</td>
                      <td>{item.id_gorra?.color}</td>
                      <td>{item.id_gorra?.talla}</td>
                      <td>${item.precio_unitario?.toFixed(2)}</td>
                      <td>
                        <Form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const cantidad = parseInt(formData.get('cantidad'));
                            handleActualizarCantidad(item._id, cantidad);
                          }}
                          className="d-flex align-items-center"
                        >
                          <Form.Control
                            type="number"
                            name="cantidad"
                            defaultValue={item.cantidad}
                            min="1"
                            max={item.id_gorra?.stock}
                            style={{ width: '80px' }}
                            className="me-2"
                          />
                          <Button type="submit" variant="outline-primary" size="sm">
                            ✓ Actualizar
                          </Button>
                        </Form>
                      </td>
                      <td>${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleEliminarItem(item._id)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5">Subtotal:</td>
                    <td>${carrito.subtotal?.toFixed(2) || '0.00'}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="5">IVA (15%):</td>
                    <td>${carrito.iva?.toFixed(2) || '0.00'}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="5">Transporte:</td>
                    <td>Gratis</td>
                    <td></td>
                  </tr>
                  <tr className="total">
                    <td colSpan="5">Total a pagar:</td>
                    <td>${carrito.total?.toFixed(2) || '0.00'}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>

            <div className="acciones-carrito mt-4">
              <Row>
                <Col>
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