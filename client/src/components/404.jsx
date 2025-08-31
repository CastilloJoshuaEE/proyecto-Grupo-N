import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
const Pagina404 = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      
      <Container className="my-5 text-center flex-grow-1 d-flex align-items-center justify-content-center">
        <div>
          <h1 className="display-1">404</h1>
          <p className="lead">Página no encontrada</p>
          <p>La página que estás buscando no existe o ha sido movida.</p>
          <Button as={Link} to="/" variant="primary">
            Volver al inicio
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Pagina404;