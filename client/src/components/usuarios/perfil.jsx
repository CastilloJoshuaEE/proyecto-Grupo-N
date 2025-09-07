import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import '../../assets/css/registro.css';

const Perfil = () => {
  const [usuario, setUsuario] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    cedula: '',
    direccion: '',
    telefono: ''
  });
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    obtenerPerfil();
  }, []);

  const obtenerPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/usuario/perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error('Error al obtener perfil');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setUsuario(datos.data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/usuario/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuario)
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || 'Error al actualizar perfil');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        toast.success('Perfil actualizado exitosamente');
        setEditando(false);
        // Actualizar datos en el contexto de autenticación si es necesario
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
      <h1 className="mb-4">Mi Perfil</h1>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Información personal</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={usuario.nombre}
                    onChange={handleChange}
                    required
                    readOnly={!editando}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={usuario.apellido}
                    onChange={handleChange}
                    required
                    readOnly={!editando}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={usuario.correo}
                    onChange={handleChange}
                    required
                    readOnly={!editando}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Cédula</Form.Label>
                  <Form.Control
                    type="text"
                    name="cedula"
                    value={usuario.cedula}
                    onChange={handleChange}
                    required
                    readOnly={!editando}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion"
                    value={usuario.direccion || ''}
                    onChange={handleChange}
                    required
                    readOnly={!editando}
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={usuario.telefono || ''}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{7,15}"
                    readOnly={!editando}
                  />
                </Form.Group>
                
                {editando ? (
                  <div className="d-grid gap-2 d-md-flex">
                    <Button type="submit" variant="primary" disabled={guardando}>
                      {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => setEditando(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                    <Button variant="primary" onClick={() => navigate('/editar-perfil')}>
                    Editar Perfil
                    </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Seguridad</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid">
                <Button 
                  variant="warning" 
                  onClick={() => navigate('/cambiar-contrasena')}
                >
                  Cambiar Contraseña
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Perfil;