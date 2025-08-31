import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Modal } from 'react-bootstrap';
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
    <Container className="my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h3 className="text-center mb-0">Ingrese a su cuenta</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico:</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña:</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </div>
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button type="submit" variant="primary">
                    Iniciar sesión
                  </Button>
                </div>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setShowModal(true)}
                    className="me-3"
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                  <span className="text-muted">|</span>
                  <Link to="/registro" className="btn btn-link">
                    Regístrate
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal para recuperar contraseña */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Recuperar Contraseña</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRecuperarSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={recuperarData.correo}
                onChange={handleRecuperarChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nueva contraseña</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showRecuperarPassword ? "text" : "password"}
                  name="nueva_contrasena"
                  value={recuperarData.nueva_contrasena}
                  onChange={handleRecuperarChange}
                  required
                  minLength={6}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowRecuperarPassword(!showRecuperarPassword)}
                >
                  {showRecuperarPassword ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Repetir contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmar_contrasena"
                value={recuperarData.confirmar_contrasena}
                onChange={handleRecuperarChange}
                required
                minLength={6}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              Actualizar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Login;