import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

const EditarCliente = () => {
  const [cliente, setCliente] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: ''
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (usuario && usuario.tipo === 'admin') {
      obtenerCliente();
    }
  }, [usuario, id]);

  const obtenerCliente = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/admin/clientes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error('Error al obtener cliente');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setCliente(datos.data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/admin/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cliente)
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || 'Error al actualizar cliente');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        toast.success('Cliente actualizado exitosamente');
        navigate('/admin/clientes');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGuardando(false);
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
      <div className="auth-form" style={{ maxWidth: '480px', margin: 'auto' }}>
        <h2 className="text-center mb-4">Editar cliente</h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre:</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={cliente.nombre}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido:</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={cliente.apellido}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo:</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={cliente.correo}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono:</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={cliente.telefono || ''}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Dirección:</Form.Label>
            <Form.Control
              type="text"
              name="direccion"
              value={cliente.direccion || ''}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : '💾 Guardar cambios'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <Link to="/admin/clientes" className="btn btn-secondary">
            ⬅ Volver a lista de clientes
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default EditarCliente;