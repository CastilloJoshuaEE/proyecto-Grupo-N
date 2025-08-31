import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

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

      <div className="text-end mb-3">
        <Link to="/admin/gorras/crear" className="btn btn-success">
          + Registrar gorra
        </Link>
      </div>

      <Card className="p-4">
        <h2>Lista de gorras</h2>
        {gorras.length === 0 ? (
          <Alert variant="info" className="text-center">
            No hay gorras registradas.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table className="tabla-factura">
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
                    <td>{gorra._id}</td>
                    <td>{gorra.nombre}</td>
                    <td>{gorra.tipo}</td>
                    <td>{gorra.talla}</td>
                    <td>{gorra.color}</td>
                    <td>${gorra.precio.toFixed(2)}</td>
                    <td>{gorra.stock}</td>
                    <td>{gorra.disponible ? 'Sí' : 'No'}</td>
                    <td>
                      <Link
                        to={`/admin/gorras/editar/${gorra._id}`}
                        className="btn btn-sm btn-warning me-2"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <div className="mt-4">
        <Link to="/admin/dashboard" className="btn btn-secondary">
          ⬅ Volver al panel administrativo
        </Link>
      </div>
    </Container>
  );
};

export default GestionGorras;