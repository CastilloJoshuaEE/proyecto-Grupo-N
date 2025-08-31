import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CambiarContrasena = () => {
  const [formData, setFormData] = useState({
    correo: '',
    nueva_contrasena: '',
    confirmar_contrasena: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Prellenar el correo si el usuario está logueado
  React.useEffect(() => {
    if (usuario) {
      setFormData(prev => ({ ...prev, correo: usuario.correo }));
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    if (formData.nueva_contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      setCargando(false);
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios/cambiar-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.message || 'Error al cambiar contraseña');
      }

      if (datos.success) {
        toast.success('Contraseña cambiada exitosamente');
        navigate('/perfil');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h3 className="text-center mb-0">Cambiar Contraseña</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    disabled={!!usuario}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nueva contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="nueva_contrasena"
                    value={formData.nueva_contrasena}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmar nueva contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmar_contrasena"
                    value={formData.confirmar_contrasena}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={cargando}
                  >
                    {cargando ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/perfil')}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default CambiarContrasena;