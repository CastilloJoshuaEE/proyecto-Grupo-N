import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Table, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { toast } from 'react-hot-toast';

const FinalizarCompra = () => {
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [usuario, setUsuario] = useState(null);
const [direccionEditada, setDireccionEditada] = useState('');
  const { vaciarCarrito } = useCarrito();
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [datosTransferencia, setDatosTransferencia] = useState({
    cuenta_origen: '',
    fecha_transferencia: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [editandoDireccion, setEditandoDireccion] = useState(false);

  const { usuario: authUsuario } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (!authUsuario) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, [authUsuario]);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener carrito
      const respuestaCarrito = await fetch(`${API_URL}/api/carrito`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuestaCarrito.ok) {
        throw new Error('Error al obtener carrito');
      }

      const datosCarrito = await respuestaCarrito.json();
      if (datosCarrito.success) {
        setCarrito(datosCarrito.data);
      }

      // Obtener perfil de usuario
      const respuestaUsuario = await fetch(`${API_URL}/api/usuario/perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (respuestaUsuario.ok) {
        const datosUsuario = await respuestaUsuario.json();
        if (datosUsuario.success) {
          setUsuario(datosUsuario.data);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };
  // Función para actualizar la dirección del usuario
  const actualizarDireccion = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/usuario/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ direccion: direccionEditada })
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        if (datos.success) {
          setUsuario(datos.data);
          setEditandoDireccion(false);
          toast.success('Dirección actualizada correctamente');
        }
      }
    } catch (error) {
      toast.error('Error al actualizar la dirección');
    }
  }; 
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (metodoPago === 'transferencia' && !datosTransferencia.cuenta_origen) {
    toast.error('Complete los datos de transferencia');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const datosPago = {
      metodo_pago: metodoPago,
      datos_transferencia: metodoPago === 'transferencia' ? datosTransferencia : null
    };

    const respuesta = await fetch(`${API_URL}/api/compras/finalizar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(datosPago)
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json();
      throw new Error(errorData.message || 'Error al procesar la compra');
    }

    const datos = await respuesta.json();
    if (datos.success) {
      // Vaciar el carrito usando la función del contexto
      await vaciarCarrito();
      toast.success('Compra realizada exitosamente');
      navigate(`/compra-exitosa?id=${datos.data._id}`);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

  const guardarDatosTransferencia = () => {
    if (!datosTransferencia.cuenta_origen || !datosTransferencia.fecha_transferencia) {
      toast.error('Complete todos los campos de transferencia');
      return;
    }
    setShowModal(false);
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
      <h1 className="mb-4">Finalizar compra</h1>

      <Row>
        <Col md={8}>
          <Form onSubmit={handleSubmit} id="formulario-pago">
            <h2>Datos personales</h2>
            <p className="text-muted">
              La dirección seleccionada se utilizará tanto como su dirección personal 
              (para la factura) como su dirección de entrega.
            </p>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombres:</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={usuario?.nombre || ''}
                    required
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellidos:</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={usuario?.apellido || ''}
                    required
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

         <Form.Group className="mb-3">
              <Form.Label>Dirección:</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="text"
                  name="direccion"
                  value={direccionEditada}
                  onChange={(e) => setDireccionEditada(e.target.value)}
                  required
                  readOnly={!editandoDireccion}
                />
                {editandoDireccion ? (
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="ms-2"
                    onClick={actualizarDireccion}
                  >
                    ✓
                  </Button>
                ) : (
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="ms-2"
                    onClick={() => setEditandoDireccion(true)}
                  >
                    ✎
                  </Button>
                )}
              </div>
              <Form.Text className="text-muted">
                Haga clic en el ícono de lápiz para editar su dirección de entrega
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad:</Form.Label>
                  <Form.Control
                    type="text"
                    value="Guayaquil"
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>País:</Form.Label>
                  <Form.Control
                    type="text"
                    value="Ecuador"
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono:</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                value={usuario?.telefono || ''}
                required
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cédula:</Form.Label>
              <Form.Control
                type="text"
                name="cedula"
                value={usuario?.cedula || ''}
                required
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Método de pago:</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  name="metodo_pago"
                  value="efectivo"
                  label="Efectivo (acercarse a nuestra sucursal: Dirección: R459+R4H, Victor Manuel Rendón, Guayaquil 090313)"
                  checked={metodoPago === 'efectivo'}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  name="metodo_pago"
                  value="transferencia"
                  label="Transferencia bancaria (Banco Pichincha)"
                  checked={metodoPago === 'transferencia'}
                  onChange={(e) => {
                    setMetodoPago(e.target.value);
                    setShowModal(true);
                  }}
                />
              </div>
            </Form.Group>

            <input type="hidden" name="cuenta_origen" value={datosTransferencia.cuenta_origen} />
            <input type="hidden" name="fecha_transferencia" value={datosTransferencia.fecha_transferencia} />

            <div className="d-grid gap-2 d-md-flex">
              <Button type="submit" variant="primary" size="lg">
                Completar compra
              </Button>
              <Button variant="secondary" onClick={() => navigate('/carrito')}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Col>

        <Col md={4}>
          <div className="sticky-top" style={{ top: '20px' }}>
            <h3>Resumen de pedido</h3>
            <Table className="tabla-productos">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {carrito.items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.id_gorra?.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Subtotal:</td>
                  <td>${carrito.subtotal?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="2">IVA (15%):</td>
                  <td>${carrito.iva?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="2">Transporte:</td>
                  <td>Gratis</td>
                </tr>
                <tr className="total">
                  <td colSpan="2">Total a pagar:</td>
                  <td>${carrito.total?.toFixed(2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </Col>
      </Row>

      {/* Modal Transferencia Bancaria */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Datos de Transferencia Bancaria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cuenta de origen</Form.Label>
              <Form.Control
                type="number"
                placeholder="0123456789"
                value={datosTransferencia.cuenta_origen}
                onChange={(e) => setDatosTransferencia({
                  ...datosTransferencia,
                  cuenta_origen: e.target.value
                })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cuenta acreditada</Form.Label>
              <Form.Control
                type="text"
                value="0123456789"
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del beneficiario</Form.Label>
              <Form.Control
                type="text"
                value="Gorras Premium S.A."
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Monto a transferir</Form.Label>
              <Form.Control
                type="text"
                value={`$${carrito.total?.toFixed(2)}`}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de transferencia</Form.Label>
              <Form.Control
                type="date"
                value={datosTransferencia.fecha_transferencia}
                onChange={(e) => setDatosTransferencia({
                  ...datosTransferencia,
                  fecha_transferencia: e.target.value
                })}
                required
              />
            </Form.Group>
            <p className="text-muted">
              La referencia de transferencia será generada automáticamente al completar la compra.
            </p>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarDatosTransferencia}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FinalizarCompra;