import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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

  if (cargando) {
    return (
      <Container className="login-container d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="login-container d-flex align-items-center justify-content-center py-5">
      <Row className="justify-content-center w-100">
        <Col md={10} lg={8}>
          <h1 className="text-center mb-4 fw-bold text-dark">Mi Perfil</h1>
          
          <Row>
            <Col md={6}>
              <Card className="login-card shadow border-0 mb-4">
                <Card.Header className="bg-dark text-white text-center py-3">
                  <h5 className="mb-0 fw-bold">Información personal</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold text-dark mb-2">Nombre</Form.Label>
                          <Form.Control
                            type="text"
                            value={usuario.nombre}
                            readOnly
                            className="py-2 px-3 border-2 bg-light"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold text-dark mb-2">Apellido</Form.Label>
                          <Form.Control
                            type="text"
                            value={usuario.apellido}
                            readOnly
                            className="py-2 px-3 border-2 bg-light"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-dark mb-2">Correo electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        value={usuario.correo}
                        readOnly
                        className="py-2 px-3 border-2 bg-light"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-dark mb-2">Cédula</Form.Label>
                      <Form.Control
                        type="text"
                        value={usuario.cedula}
                        readOnly
                        className="py-2 px-3 border-2 bg-light"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-dark mb-2">Dirección</Form.Label>
                      <Form.Control
                        type="text"
                        value={usuario.direccion || ''}
                        readOnly
                        className="py-2 px-3 border-2 bg-light"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark mb-2">Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        value={usuario.telefono || ''}
                        readOnly
                        className="py-2 px-3 border-2 bg-light"
                      />
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button 
                        variant="dark" 
                        size="lg"
                        className="fw-bold py-2"
                        onClick={() => navigate('/editar-perfil')}
                      >
                        Editar Perfil
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="login-card shadow border-0">
                <Card.Header className="bg-dark text-white text-center py-3">
                  <h5 className="mb-0 fw-bold">Seguridad</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="d-grid">
                    <Button 
                      variant="outline-dark" 
                      size="lg"
                      className="fw-bold py-2"
                      onClick={() => navigate('/cambiar-contrasena')}
                    >
                      Cambiar Contraseña
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Perfil;