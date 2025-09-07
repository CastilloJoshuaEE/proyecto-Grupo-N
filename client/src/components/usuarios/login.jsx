import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Modal, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import '../../assets/css/registro.css';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  const [recuperarData, setRecuperarData] = useState({
    correo: '',
    nueva_contrasena: '',
    confirmar_contrasena: ''
  });
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecuperarPassword, setShowRecuperarPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecuperarChange = (e) => {
    const { name, value } = e.target;
    setRecuperarData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRecuperarSubmit = async (e) => {
    e.preventDefault();
    
    if (recuperarData.nueva_contrasena !== recuperarData.confirmar_contrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const respuesta = await fetch(`${API_URL}/api/usuarios/recuperar-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recuperarData)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.message || 'Error al recuperar contraseña');
      }

      if (datos.success) {
        toast.success('✅ Contraseña actualizada exitosamente. Inicia sesion...');
        setShowModal(false);
        setRecuperarData({
          correo: '',
          nueva_contrasena: '',
          confirmar_contrasena: ''
        });
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Container className="login-container d-flex align-items-center justify-content-center py-5">
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6} xl={5}>
          <Card className="login-card shadow border-0">
            <Card.Header className="bg-dark text-white text-center py-4">
              <h2 className="mb-0 fw-bold">Ingrese a su cuenta</h2>
            </Card.Header>
            
            <Card.Body className="p-5">
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              
              <Form onSubmit={handleSubmit} className="login-form">
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
                    Contraseña:
                  </Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      required
                      className="py-3 px-4 border-2 border-end-0"
                      placeholder="Ingrese su contraseña"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      className="border-2 border-start-0 px-3"
                      type="button"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </Button>
                  </div>
                </Form.Group>

                <div className="d-grid mb-4">
                  <Button 
                    type="submit" 
                    variant="dark" 
                    size="lg" 
                    className="fw-bold py-3"
                  >
                    Iniciar sesión
                  </Button>
                </div>

                <div className="text-center pt-3">
                  <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
                    <Button 
                      variant="link" 
                      onClick={() => setShowModal(true)}
                      className="text-decoration-none text-dark p-0 fw-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>
                    <span className="text-muted d-none d-md-inline">|</span>
                    <Link 
                      to="/registro" 
                      className="text-decoration-none text-primary fw-medium p-0"
                    >
                      Regístrate
                    </Link>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para recuperar contraseña */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title className="fw-bold">Recuperar Contraseña</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRecuperarSubmit}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={recuperarData.correo}
                onChange={handleRecuperarChange}
                required
                className="py-2"
                placeholder="Ingrese su correo electrónico"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Nueva contraseña</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showRecuperarPassword ? "text" : "password"}
                  name="nueva_contrasena"
                  value={recuperarData.nueva_contrasena}
                  onChange={handleRecuperarChange}
                  required
                  minLength={6}
                  className="py-2"
                  placeholder="Mínimo 6 caracteres"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowRecuperarPassword(!showRecuperarPassword)}
                  className="px-3"
                  type="button"
                >
                  {showRecuperarPassword ? '🙈' : '👁️'}
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Repetir contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmar_contrasena"
                value={recuperarData.confirmar_contrasena}
                onChange={handleRecuperarChange}
                required
                minLength={6}
                className="py-2"
                placeholder="Repita la contraseña"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="px-4 pb-4">
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="success" type="submit" className="fw-semibold">
              Actualizar Contraseña
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Login;