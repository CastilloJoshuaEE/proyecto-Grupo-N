import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { useCarrito } from '../components/context/CarritoContext';
import { toast } from 'react-hot-toast';

const Inicio = () => {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { agregarAlCarrito } = useCarrito();
  const { usuario } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    obtenerProductosDestacados();
  }, []);

const obtenerProductosDestacados = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/api/gorras/destacadas`);
    
    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${respuesta.status}: ${respuesta.statusText}`);
    }

    const datos = await respuesta.json();
    
    if (datos.success) {
      setProductosDestacados(datos.data);
    } else {
      throw new Error(datos.message || 'Error en formato de respuesta');
    }
  } catch (error) {
    console.error('Error detallado:', error);
    setError(error.message);
    toast.error('Error al cargar productos destacados');
  } finally {
    setCargando(false);
  }
};

  const handleAgregarCarrito = async (idProducto) => {
    if (!usuario) {
      toast.error('Debe iniciar sesión para agregar productos al carrito');
      return;
    }

    try {
      await agregarAlCarrito(idProducto, 1);
      toast.success('Producto agregado al carrito');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <main className="container my-5">
        <section className="hero bg-light p-5 rounded text-center mb-5">
          <h1 className="display-4">Las mejores gorras de Ecuador</h1>
          <p className="lead">Calidad premium desde 2025</p>
          <Button as={Link} to="/catalogo" variant="primary" size="lg">
            Ver catálogo
          </Button>
        </section>

        <section className="featured-products">
          <h2 className="mb-4">Productos destacados</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {cargando ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <Row id="contenedor-productos">
              {productosDestacados.map((producto) => (
                <Col key={producto._id} md={3} className="mb-4">
                  <Card className="h-100">
                    <Card.Img 
                      variant="top" 
                      src={producto.imagen  ? `${process.env.REACT_APP_API_URL}${producto.imagen}` : '/img/gorra-default.jpg'} 
                      alt={producto.nombre}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{producto.nombre || 'Producto sin nombre'}</Card.Title>
                      <Card.Text>
                        <strong>${Number(producto.precio || 0).toFixed(2)}</strong>
                      </Card.Text>
                      <Button 
                        variant="success" 
                        className="agregar-carrito mt-auto"
                        onClick={() => handleAgregarCarrito(producto._id)}
                        disabled={!producto.disponible || producto.stock === 0}
                      >
                        {!producto.disponible || producto.stock === 0 ? 'No disponible' : 'Añadir al carrito'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>
      </main>
    </>
  );
};

export default Inicio;