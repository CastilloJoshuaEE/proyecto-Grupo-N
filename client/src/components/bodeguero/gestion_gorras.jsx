import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import '../../assets/css/gestion_gorras.css';

const GestionGorras = () => {
  const [gorras, setGorras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    // Verificar permisos
    if (usuario && !['admin', 'bodeguero'].includes(usuario.tipo)) {
      navigate('/login');
      return;
    }
    obtenerGorras();
  }, [usuario, navigate]);

  const obtenerGorras = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/gorras?disponible=all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error('Error al obtener gorras');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setGorras(datos.data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta gorra?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/admin/gorras/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || 'Error al eliminar gorra');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        toast.success('Gorra eliminada exitosamente');
        obtenerGorras(); // Recargar la lista
      }
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
      <h1 className="mb-4 text-center">Panel de gestión de gorras</h1>

      <Row className="mb-3">
        <Col>
          <Link to="/admin/dashboard" className="btn btn-secondary me-2">
            ⬅ Volver al panel administrativo
          </Link>
          <Link to="/admin/gorras/crear" className="btn btn-success">
            + Registrar gorra
          </Link>
        </Col>
      </Row>

      <Card className="p-4">
        <h2>Lista de gorras</h2>
        {gorras.length === 0 ? (
          <Alert variant="info" className="text-center">
            No hay gorras registradas.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table className="tabla-productos" responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Talla</th>
                  <th>Color</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gorras.map((gorra) => (
                  <tr key={gorra._id}>
                    <td data-label="ID">{gorra._id.substring(0, 8)}...</td>
                    <td data-label="Nombre">{gorra.nombre}</td>
                    <td data-label="Tipo">{gorra.tipo}</td>
                    <td data-label="Talla">{gorra.talla}</td>
                    <td data-label="Color">{gorra.color}</td>
                    <td data-label="Precio">${gorra.precio.toFixed(2)}</td>
                    <td data-label="Stock">{gorra.stock}</td>
                    <td data-label="Disponible">{gorra.disponible ? 'Sí' : 'No'}</td>
                    <td data-label="Acciones">
                      <div className="d-flex flex-wrap gap-1">
                        <Link
                          to={`/admin/gorras/editar/${gorra._id}`}
                          className="btn btn-sm btn-warning"
                        >
                          Editar
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleEliminar(gorra._id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default GestionGorras;