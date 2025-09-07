import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import '../../assets/css/registro.css';

const EditarPerfil = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    cedula: '',
    direccion: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (usuario) {
      obtenerPerfil();
    } else {
      navigate('/login');
    }
  }, [usuario]);

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
        setFormData({
          nombre: datos.data.nombre || '',
          apellido: datos.data.apellido || '',
          correo: datos.data.correo || '',
          cedula: datos.data.cedula || '',
          direccion: datos.data.direccion || '',
          telefono: datos.data.telefono || ''
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/usuario/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.message || 'Error al actualizar perfil');
      }

      if (datos.success) {
        toast.success('Perfil actualizado exitosamente');
        navigate('/perfil');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setGuardando(false);
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
        <Col md={8} lg={6} xl={5}>
          <Card className="login-card shadow border-0">
            <Card.Header className="bg-dark text-white text-center py-4">
              <h2 className="mb-0 fw-bold">Editar Perfil</h2>
            </Card.Header>
            
            <Card.Body className="p-5">
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              
              <Form onSubmit={handleSubmit} className="login-form">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark mb-2">
                        Nombre:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 border-2"
                        placeholder="Ingrese su nombre"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark mb-2">
                        Apellido:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 border-2"
                        placeholder="Ingrese su apellido"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark mb-2">
                    Correo electrónico:
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    className="py-3 px-4 border-2"
                    placeholder="ejemplo@correo.com"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark mb-2">
                    Cédula:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    required
                    className="py-3 px-4 border-2"
                    placeholder="Ingrese su cédula"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark mb-2">
                    Dirección:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                    className="py-3 px-4 border-2"
                    placeholder="Ingrese su dirección"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark mb-2">
                    Teléfono:
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    pattern="[0-9]{7,15}"
                    required
                    className="py-3 px-4 border-2"
                    placeholder="Ingrese su teléfono"
                  />
                </Form.Group>

                <div className="d-grid gap-2 d-md-flex">
                  <Button 
                    type="submit" 
                    variant="dark" 
                    size="lg"
                    className="fw-bold py-3 flex-fill"
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    className="fw-bold py-3 flex-fill"
                    onClick={() => navigate('/perfil')}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditarPerfil;