import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

const Reportes = () => {
  const [ventas, setVentas] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (usuario && usuario.tipo === 'admin') {
      obtenerVentas();
    }
  }, [usuario, filtros]);

  const obtenerVentas = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const respuesta = await fetch(`${API_URL}/api/admin/ventas?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error('Error al obtener ventas');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setVentas(datos.data);
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
    obtenerVentas();
  };

  const limpiarFiltros = () => {
    setFiltros({ fecha_inicio: '', fecha_fin: '' });
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
        <h1>Reportes</h1>
        
        <Form onSubmit={aplicarFiltros} className="row g-2">
          <div className="col-auto">
            <Form.Control
              type="date"
              name="fecha_inicio"
              value={filtros.fecha_inicio}
              onChange={handleFiltroChange}
            />
          </div>
          <div className="col-auto">
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

      {/* Reporte de ventas */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Ventas</h5>
        </div>
        <div className="card-body">
          {ventas.length === 0 ? (
            <Alert variant="info">No hay ventas con los filtros seleccionados</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped>
                <thead>
                  <tr>
                    <th>ID Venta</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Método pago</th>
                    <th>Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta._id}>
                      <td>{venta._id}</td>
                      <td>
                        {venta.id_usuario?.nombre} {venta.id_usuario?.apellido}
                      </td>
                      <td>{new Date(venta.fecha_venta).toLocaleString()}</td>
                      <td>${venta.total.toFixed(2)}</td>
                      <td>{venta.metodo_pago}</td>
                      <td>{venta.factura?.numero_factura || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Reportes;