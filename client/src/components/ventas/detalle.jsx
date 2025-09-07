import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

const DetalleVenta = () => {
  const [venta, setVenta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    obtenerDetalleVenta();
  }, [usuario, id]);

  const obtenerDetalleVenta = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/compras/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || 'Error al obtener detalle de venta');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setVenta(datos.data);
      }
    } catch (error) {
      toast.error(error.message);
      navigate('/historial-pedidos');
    } finally {
      setCargando(false);
    }
  };

  const getBadgeVariant = (estado) => {
    switch (estado) {
      case 'completada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'secondary';
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImprimir = () => {
    window.print();
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

  if (!venta) {
    return (
      <Container className="my-5">
        <Alert variant="danger">No se pudo cargar la información de la venta</Alert>
      </Container>
    );
  }

  // Obtener información del usuario - usar info_usuario si existe, sino usar id_usuario
  const infoCliente = venta.info_usuario || venta.id_usuario;

  return (
    <Container className="my-5">
      {/* Información de la empresa */}
      <Card className="mb-4 print-section">
        <Card.Body className="text-center">
          <h1>Kawsay Caps S.A.</h1>
          <p className="mb-1">Guayas, Ecuador</p>
          <p className="mb-1">Sucursal: R459+R4H, Victor Manuel Rendón, Guayaquil 090313</p>
          <p className="mb-1">
            Correo electrónico: <a href="mailto:kawsaycaps@gmail.com">kawsaycaps@gmail.com</a>
          </p>
          <p>Teléfono: <a href="tel:+593939850101">0939850101</a></p>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Factura #{venta.factura?.numero_factura || venta._id}</h2>
        <div>
          <Button variant="outline-primary" onClick={handleImprimir} className="me-2">
            Imprimir Factura
          </Button>
          <Button variant="primary" onClick={() => navigate('/catalogo')}>
            Ver Catálogo
          </Button>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Información de la factura</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Fecha:</strong> {formatFecha(venta.fecha_venta)}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <Badge bg={getBadgeVariant(venta.estado)}>
                  {venta.estado}
                </Badge>
              </p>
              <p><strong>Método de pago:</strong> {venta.metodo_pago}</p>
              <p><strong>Total:</strong> ${venta.total?.toFixed(2)}</p>
              {venta.factura?.numero_factura && (
                <p><strong>N° Factura:</strong> {venta.factura.numero_factura}</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Información del cliente</h5>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Nombre:</strong>{' '}
                {infoCliente.nombre} {infoCliente.apellido}
              </p>
              <p><strong>Cédula:</strong> {infoCliente.cedula}</p>
              <p><strong>Correo electrónico:</strong> {infoCliente.correo}</p>
              <p><strong>Teléfono:</strong> {infoCliente.telefono || 'No especificado'}</p>
              {/* MOSTRAR LA DIRECCIÓN AQUÍ */}
              <p><strong>Dirección:</strong> {infoCliente.direccion || 'No especificada'}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {venta.metodo_pago === 'transferencia' && venta.datos_transferencia && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Datos de transferencia</h5>
          </Card.Header>
          <Card.Body>
            <p><strong>Cuenta origen:</strong> {venta.datos_transferencia.cuenta_origen}</p>
            <p><strong>Cuenta destino:</strong> {venta.datos_transferencia.cuenta_destino}</p>
            <p><strong>Referencia:</strong> {venta.datos_transferencia.referencia}</p>
            <p><strong>Monto transferido:</strong> ${venta.datos_transferencia.monto?.toFixed(2)}</p>
            <p><strong>Fecha de transferencia:</strong> {formatFecha(venta.datos_transferencia.fecha_transferencia)}</p>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Productos comprados</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.items.map((producto, index) => (
                <tr key={index}>
                  <td>{producto.nombre}</td>
                  <td>{producto.cantidad}</td>
                  <td>${producto.precio_unitario?.toFixed(2)}</td>
                  <td>${(producto.precio_unitario * producto.cantidad).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                <td>${venta.factura?.subtotal?.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end"><strong>IVA (12%):</strong></td>
                <td>${venta.factura?.iva?.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                <td>${venta.factura?.total?.toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
        </Card.Body>
      </Card>

      <style>
      {`
        @media print {
          .btn {
            display: none !important;
          }
          .print-section {
            border: none !important;
          }
        }
      `}
      </style>
    </Container>
  );
};

export default DetalleVenta;