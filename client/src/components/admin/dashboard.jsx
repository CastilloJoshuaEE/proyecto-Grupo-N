import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    total_ventas: 0,
    media: 0,
    mediana: 0,
    moda: 0,
    ventas_por_dia: {},
    ventas_por_metodo: { efectivo: 0, transferencia: 0 }
  });
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (usuario && usuario.tipo === 'admin') {
      obtenerDatosDashboard();
    }
  }, [usuario, filtros]);

  const obtenerDatosDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const [estadisticasRes, productosRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/reportes/ventas?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_URL}/api/admin/reportes/productos-mas-vendidos?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!estadisticasRes.ok || !productosRes.ok) {
        throw new Error('Error al obtener datos del dashboard');
      }

      const estadisticasData = await estadisticasRes.json();
      const productosData = await productosRes.json();

      if (estadisticasData.success) {
        setEstadisticas(estadisticasData.data);
      }

      if (productosData.success) {
        setProductosMasVendidos(productosData.data);
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
    obtenerDatosDashboard();
  };

  const limpiarFiltros = () => {
    setFiltros({ fecha_inicio: '', fecha_fin: '' });
  };

  // Datos para gráficos
const ventasPorDiaData = {
  labels: Object.keys(estadisticas.ventas_por_dia || {}),
  datasets: [
    {
      label: 'Ventas por día',
      data: Object.values(estadisticas.ventas_por_dia || {}),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

const metodoPagoData = {
  labels: ['Efectivo', 'Transferencia'],
  datasets: [
    {
      data: [
        estadisticas.ventas_por_metodo?.efectivo || 0,
        estadisticas.ventas_por_metodo?.transferencia || 0
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(75, 192, 192, 0.5)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1,
    },
  ],
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
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Panel de administrador</h1>
        
        <Form onSubmit={aplicarFiltros} className="row g-2">
          <div className="col-auto">
            <p>Desde:</p>
            <Form.Control
              type="date"
              name="fecha_inicio"
              value={filtros.fecha_inicio}
              onChange={handleFiltroChange}
            />
          </div>
          <div className="col-auto">
            <p>hasta:</p>
            <Form.Control
              type="date"
              name="fecha_fin"
              value={filtros.fecha_fin}
              onChange={handleFiltroChange}
            />
          </div>
          <div className="col-auto">
            <Button type="submit" variant="primary">Filtrar</Button>
            <Button variant="outline-secondary" onClick={limpiarFiltros} className="ms-2">
              Limpiar
            </Button>
          </div>
        </Form>
      </div>

      {/* Estadísticas principales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card bg="primary" text="white">
            <Card.Body>
              <Card.Title>Total ventas</Card.Title>
              <Card.Text className="h4">
                ${(estadisticas.total_ventas || 0).toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="success" text="white">
            <Card.Body>
              <Card.Title>Media</Card.Title>
              <Card.Text className="h4">
                ${(estadisticas.media || 0).toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="info" text="white">
            <Card.Body>
              <Card.Title>Mediana</Card.Title>
              <Card.Text className="h4">
                ${(estadisticas.mediana || 0).toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="warning" text="dark">
            <Card.Body>
              <Card.Title>Moda</Card.Title>
              <Card.Text className="h4">
                ${(estadisticas.moda || 0).toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Ventas por día</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={ventasPorDiaData} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Método de pago</h5>
            </Card.Header>
            <Card.Body>
              <Pie 
                data={metodoPagoData} 
                options={{ responsive: true }}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Productos más vendidos */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Productos más vendidos</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad vendida</th>
                <th>Total vendido</th>
              </tr>
            </thead>
            <tbody>
              {productosMasVendidos.map((producto) => (
                <tr key={producto._id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.tipo}</td>
                  <td>{producto.cantidadVendida}</td>
                  <td>${producto.totalVendido.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Menú de navegación */}
      <Card>
        <Card.Body>
          <div className="d-grid gap-2 d-md-flex justify-content-md-center">
            <Link to="/admin/clientes" className="btn btn-primary me-md-2">
              📋 Gestión de clientes
            </Link>
            <Link to="/admin/pedidos" className="btn btn-primary me-md-2">
              🧾 Historial de pedidos
            </Link>
            <Link to="/admin/reportes" className="btn btn-primary">
              📊 Reportes detallados
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;