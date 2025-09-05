import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCarrito } from '../context/CarritoContext';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const Detalle = () => {
  const [gorra, setGorra] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { usuario } = useAuth();
  const { agregarAlCarrito } = useCarrito();
  const navigate = useNavigate();

  useEffect(() => {
    obtenerGorra();
  }, [id]);

  const obtenerGorra = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/gorras/${id}`);
      //const respuesta = await fetch(`http://localhost:5001/api/gorras/${id}`);
      const datos = await respuesta.json();
      
      if (datos.success) {
        setGorra(datos.data);
      } else {
        setError('Gorra no encontrada');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarCarrito = async () => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    try {
      await agregarAlCarrito(gorra._id, 1);
      // Toast de éxito se maneja en el contexto
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
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

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Detalle de la gorra</h1>

      {gorra ? (
        <Card className="mb-4">
          <Row className="g-0">
            <Col md={4} className="text-center">
              <img 
                src={gorra.imagen ? `${process.env.REACT_APP_API_URL}${gorra.imagen}` : '/img/gorra-default.jpg'} 
                className="img-fluid rounded" 
                alt={gorra.nombre}
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
            </Col>
            <Col md={8}>
              <Card.Body>
                <h3 className="card-title">{gorra.nombre}</h3>
                <p className="card-text"><strong>Tipo:</strong> {gorra.tipo}</p>
                <p className="card-text"><strong>Talla:</strong> {gorra.talla}</p>
                <p className="card-text"><strong>Color:</strong> {gorra.color}</p>
                <p className="card-text"><strong>Precio:</strong> ${gorra.precio}</p>
                <p className="card-text"><strong>Stock:</strong> {gorra.stock}</p>
                {gorra.descripcion && (
                  <p className="card-text">
                    <strong>Descripción:</strong><br/> 
                    {gorra.descripcion}
                  </p>
                )}
                
                {gorra.stock > 0 ? (
                  <Button 
                    variant="success" 
                    onClick={handleAgregarCarrito}
                    className="me-2"
                  >
                    Añadir al carrito
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    Agotado
                  </Button>
                )}
                
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/catalogo')}
                >
                  Volver al catálogo
                </Button>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      ) : (
        <p className="text-danger">Producto no encontrado.</p>
      )}
    </Container>
  );
};

export default Detalle;