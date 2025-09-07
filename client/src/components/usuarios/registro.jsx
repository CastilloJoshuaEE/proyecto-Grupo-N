import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import '../../assets/css/registro.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    direccion: '',
    telefono: '',
    cedula: '',
    contrasena: '',
    confirmar_contrasena: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación para teléfono: solo números
    if (name === 'telefono') {
      // Permitir solo números y limitar a 10 caracteres
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    
    // Validación para cédula: limitar a 10 caracteres
    if (name === 'cedula') {
      if (value.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones adicionales antes de enviar
    if (formData.cedula.length !== 10) {
      setError('La cédula debe tener exactamente 10 caracteres');
      return;
    }

    if (formData.telefono.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos');
      return;
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Preparar datos para enviar (sin confirmar contraseña)
    const { confirmar_contrasena, ...datosRegistro } = formData;

    try {
      await registro(datosRegistro);
      navigate('/login');
       toast.success('Registro exitoso. Por favor inicia sesión.');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container className="login-container d-flex align-items-center justify-content-center py-5">
      <Row className="justify-content-center w-100">
        <Col md={10} lg={8} xl={7}>
          <Card className="login-card shadow border-0">
            <Card.Header className="bg-dark text-white text-center py-4">
              <h2 className="mb-0 fw-bold">Registro de usuario</h2>
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
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="El teléfono debe contener exactamente 10 dígitos numéricos"
                    className="py-3 px-4 border-2"
                    placeholder="10 dígitos numéricos"
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
                    maxLength={10}
                    minLength={10}
                    title="La cédula debe contener exactamente 10 caracteres"
                    className="py-3 px-4 border-2"
                    placeholder="10 caracteres"
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
                      minLength={6}
                      className="py-3 px-4 border-2 border-end-0"
                      placeholder="Mínimo 6 caracteres"
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

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark mb-2">
                    Confirmar Contraseña:
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmar_contrasena"
                    value={formData.confirmar_contrasena}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="py-3 px-4 border-2"
                    placeholder="Repita la contraseña"
                  />
                </Form.Group>

                <div className="d-grid mb-4">
                  <Button 
                    type="submit" 
                    variant="dark" 
                    size="lg" 
                    className="fw-bold py-3"
                  >
                    Registrarse
                  </Button>
                </div>

                <div className="text-center pt-3">
                  <div className="d-flex justify-content-center align-items-center gap-3">
                    <span className="text-muted">¿Ya tienes cuenta?</span>
                    <Link 
                      to="/login" 
                      className="text-decoration-none text-primary fw-medium"
                    >
                      Inicia sesión
                    </Link>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Registro;