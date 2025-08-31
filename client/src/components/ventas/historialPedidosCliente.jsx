import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Form, Row, Col, Badge, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

const HistorialPedidosCliente = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (usuario && usuario.tipo === 'cliente') {
      obtenerPedidos();
    } else {
      navigate('/login');
    }
  }, [usuario, filtros]);

  const obtenerPedidos = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const respuesta = await fetch(`${API_URL}/api/compras/historial?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error('Error al obtener historial de pedidos');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setPedidos(datos.data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    obtenerPedidos();
  };

  const limpiarFiltros = () => {
    setFiltros({ fecha_inicio: '', fecha_fin: '' });
  };

  const getBadgeVariant = (estado) => {
    switch (estado) {
      case 'completada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'secondary';
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis pedidos</h2>
        <Button variant="primary" onClick={() => navigate('/catalogo')}>
          Seguir comprando
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Filtrar pedidos</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={aplicarFiltros}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Desde</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_inicio"
                    value={filtros.fecha_inicio}
                    onChange={handleFiltroChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Hasta</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_fin"
                    value={filtros.fecha_fin}
                    onChange={handleFiltroChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button type="submit" variant="primary" className="me-2">
                  Filtrar
                </Button>
                <Button variant="outline-secondary" onClick={limpiarFiltros}>
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {pedidos.length === 0 ? (
        <Alert variant="info">
          {filtros.fecha_inicio || filtros.fecha_fin ? (
            'No se ha realizado ninguna compra en el rango de fechas seleccionado.'
          ) : (
            <>
              Aún no has realizado ningún pedido. <Alert.Link onClick={() => navigate('/catalogo')}>
                Explora nuestro catálogo
              </Alert.Link> para hacer tu primera compra.
            </>
          )}
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead className="table-light">
              <tr>
                <th>N° Pedido</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido._id}>
                  <td>#{pedido._id.substring(0, 8)}</td>
                  <td>{new Date(pedido.fecha_venta).toLocaleString()}</td>
                  <td>${pedido.total.toFixed(2)}</td>
                  <td>
                    <Badge bg={getBadgeVariant(pedido.estado)}>
                      {pedido.estado}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => navigate(`/compras/detalle/${pedido._id}`)}
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default HistorialPedidosCliente;