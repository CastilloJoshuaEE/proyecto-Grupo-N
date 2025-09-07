import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, Button, Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { FaPalette } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Encabezado = () => {
  const [busqueda, setBusqueda] = useState('');
  const { colorTema, setColorTema } = useTheme(); 
  const { usuario, logout } = useAuth();
  const { carrito } = useCarrito();
  const navigate = useNavigate();
  const location = useLocation();

  // Extraer parámetros de búsqueda actuales de la URL
  const searchParams = new URLSearchParams(location.search);
  const busquedaActual = searchParams.get('busqueda') || '';

  // Si hay una búsqueda actual, establecerla en el estado
  useEffect(() => {
    if (busquedaActual) {
      setBusqueda(busquedaActual);
    }
  }, [busquedaActual]);

  const handleBuscar = (e) => {
    e.preventDefault();
    const nuevosParams = new URLSearchParams(location.search);
    if (busqueda.trim()) {
      nuevosParams.set('busqueda', busqueda.trim());
    } else {
      nuevosParams.delete('busqueda');
    }
    navigate(`/catalogo?${nuevosParams.toString()}`);
  };

  const handleInputChange = (e) => {
    setBusqueda(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBuscar(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalItems = carrito.items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <Navbar expand="lg" style={{ backgroundColor: colorTema }} variant="dark" className="custom-header">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/img/logo.png"
            alt="kawsaycaps"
            height="50"
            className="d-inline-block align-top"
            onError={(e) => {
              e.target.src = '/img/gorra-default.jpg';
            }}
          />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Barra de búsqueda */}
          <Form className="d-flex mx-auto my-2 my-lg-0" onSubmit={handleBuscar}>
            <Form.Control
              type="search"
              placeholder="Buscar gorras por nombre..."
              className="me-2"
              value={busqueda}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              style={{ minWidth: '300px' }}
            />
            <Button variant="warning" type="submit">
              🔍 Buscar
            </Button>
          </Form>
          
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/catalogo">Catálogo</Nav.Link>
            <Nav.Link as={Link} to="/acerca">Sobre nosotros</Nav.Link>
            
            {usuario && (
              <>
                {usuario.tipo === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/admin/dashboard">Panel administrativo</Nav.Link>
                    <Nav.Link as={Link} to="/admin/gorras">Gestión de gorras</Nav.Link>
                  </>
                )}
                {usuario.tipo === 'cliente' && (
                  <Nav.Link as={Link} to="/historial-pedidos">Historial de pedidos</Nav.Link>
                )}
                {usuario.tipo === 'bodeguero' && (
                  <Nav.Link as={Link} to="/admin/gorras">Gestión de gorras</Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav className="ms-3">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                {usuario ? usuario.nombre : 'Mi cuenta'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {!usuario ? (
                  <>
                    <Dropdown.Item as={Link} to="/login">Ingresar</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/registro">Registrarse</Dropdown.Item>
                  </>
                ) : (
                  <>
                    <Dropdown.Item as={Link} to="/perfil">👤 Mi perfil</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>🔓 Cerrar sesión</Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
            
            {usuario && (
              <Button 
                as={Link} 
                to="/carrito" 
                variant="outline-warning" 
                className="ms-2 position-relative"
              >
                🛒 Mi carrito
                {totalItems > 0 && (
                  <Badge 
                    bg="danger" 
                    pill 
                    className="position-absolute top-0 start-100 translate-middle"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Encabezado;