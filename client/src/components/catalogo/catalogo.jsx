import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom'; // ← Añade useLocation
import { useAuth } from '../auth/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import '../../assets/css/catalogo.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Catalogo = () => {
  const [gorras, setGorras] = useState([]);
  const [filtros, setFiltros] = useState({
    tipo: '',
    talla: '',
    precio_min: '',
    precio_max: '',
    busqueda: ''
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();
  const { agregarAlCarrito } = useCarrito();
  const navigate = useNavigate();
  const location = useLocation(); 

  // Función para extraer parámetros de la URL
  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      busqueda: searchParams.get('busqueda') || '',
      tipo: searchParams.get('tipo') || '',
      talla: searchParams.get('talla') || '',
      precio_min: searchParams.get('precio_min') || '',
      precio_max: searchParams.get('precio_max') || ''
    };
  };

  useEffect(() => {

    const params = getQueryParams();
    setFiltros(prev => ({
      ...prev,
      ...params
    }));
  }, [location.search]); 

  useEffect(() => {
    obtenerGorras();
  }, [filtros]);

  const obtenerGorras = async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams();
      
      // Agregar solo los filtros que tengan valor
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });
      
      const respuesta = await fetch(`${API_URL}/api/gorras?${params}`);
      const datos = await respuesta.json();
      
      if (datos.success) {
        setGorras(datos.data);
      } else {
        setError('Error al cargar el catálogo');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    
    // Actualizar la URL con los filtros actuales
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params.append(key, filtros[key]);
      }
    });
    
    // Navegar a la misma página pero con nuevos parámetros
    navigate(`/catalogo?${params.toString()}`);
  };

  const limpiarFiltros = () => {
    // Limpiar todos los filtros y la URL
    setFiltros({
      tipo: '',
      talla: '',
      precio_min: '',
      precio_max: '',
      busqueda: ''
    });
    navigate('/catalogo');
  };

  const handleAgregarCarrito = async (gorra) => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    try {
      await agregarAlCarrito(gorra._id, 1);
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

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Catálogo de Gorras</h1>
      
      {/* Mostrar búsqueda actual */}
      {filtros.busqueda && (
        <Alert variant="info" className="mb-4">
          Mostrando resultados para: <strong>"{filtros.busqueda}"</strong>
          <Button 
            variant="outline-info" 
            size="sm" 
            className="ms-3"
            onClick={() => {
              setFiltros(prev => ({ ...prev, busqueda: '' }));
              navigate('/catalogo');
            }}
          >
            Limpiar búsqueda
          </Button>
        </Alert>
      )}
      
      {/* Filtros */}
      <section className="filters-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Filtrar gorras</h2>
          <Button variant="outline-secondary" onClick={limpiarFiltros}>
            Limpiar todos los filtros
          </Button>
        </div>
        
        <Form onSubmit={aplicarFiltros} id="filter-form">
          <Row>
            <Col md={3}>
              <Form.Group className="filter-group">
                <Form.Label>Tipo de gorra:</Form.Label>
                <Form.Select 
                  name="tipo"
                  value={filtros.tipo} 
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos los tipos</option>
                  <option value="deportiva">Deportiva</option>
                  <option value="elegante">Elegante</option>
                  <option value="casual">Casual</option>
                  <option value="personalizada">Personalizada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="filter-group">
                <Form.Label>Talla:</Form.Label>
                <Form.Select 
                  name="talla"
                  value={filtros.talla} 
                  onChange={handleFiltroChange}
                >
                  <option value="">Todas</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="filter-group">
                <Form.Label>Precio mínimo:</Form.Label>
                <Form.Control 
                  type="number" 
                  name="precio_min"
                  placeholder="Mínimo"
                  value={filtros.precio_min}
                  onChange={handleFiltroChange}
                  min="0"
                  step="0.1"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="filter-group">
                <Form.Label>Precio máximo:</Form.Label>
                <Form.Control 
                  type="number" 
                  name="precio_max"
                  placeholder="Máximo"
                  value={filtros.precio_max}
                  onChange={handleFiltroChange}
                  min="0"
                  step="0.1"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="filter-group">
                <Form.Label>Buscar:</Form.Label>
                <Form.Control 
                  type="text" 
                  name="busqueda"
                  placeholder="Buscar gorras..."
                  value={filtros.busqueda}
                  onChange={handleFiltroChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex gap-2 mt-3">
            <Button type="submit" variant="primary" className="btn-filtrar">
              Aplicar Filtros
            </Button>
            <Button type="button" variant="outline-secondary" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </div>
        </Form>
      </section>

      {/* Lista de gorras */}
      <section className="catalogo-grid">
        <h2 className="section-title">Nuestras gorras disponibles</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Row className="gorras-container">
          {gorras.length === 0 ? (
            <Col>
              <p className="text-muted">No se encontraron gorras con los filtros aplicados.</p>
              <Button variant="primary" onClick={limpiarFiltros}>
                Ver todas las gorras
              </Button>
            </Col>
          ) : (
            gorras.map(gorra => (
              <Col md={4} key={gorra._id} className="mb-4">
                <Card className="h-100 gorras-card">
                  <div className="gorras-imagen">
                  <Card.Img 
                    variant="top" 
                    src={gorra.imagen ? `${API_URL}${gorra.imagen}` : '/img/gorra-default.jpg'} 
                    alt={gorra.nombre}
                    onError={(e) => {
                      e.target.src = '/img/gorra-default.jpg';
                    }}
                  />
                  </div>
                  <Card.Body className="gorras-info">
                    <Card.Title>{gorra.nombre}</Card.Title>
                    <Card.Text>
                      <span className="gorras-tipo">{gorra.tipo}</span><br/>
                      <strong>Talla:</strong> {gorra.talla}<br/>
                      <strong>Color:</strong> {gorra.color}<br/>
                      <strong className="gorras-precio">Precio: ${gorra.precio}</strong><br/>
                      <strong>Stock:</strong> {gorra.stock}<br/>
                      {gorra.descripcion && (
                        <>
                          <strong>Descripción:</strong> {gorra.descripcion}
                        </>
                      )}
                    </Card.Text>
                    <div className="mt-auto">
                      {gorra.stock > 0 ? (
                        <Button 
                          variant="success" 
                          className="w-100 agregar-carrito"
                          onClick={() => handleAgregarCarrito(gorra)}
                        >
                          Añadir al carrito
                        </Button>
                      ) : (
                        <Button variant="secondary" className="w-100" disabled>
                          Agotado
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </section>
    </Container>
  );
};

export default Catalogo;