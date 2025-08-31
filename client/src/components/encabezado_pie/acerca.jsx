import React from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';

const Acerca = () => {
  return (
    <Container className="my-5">
      <Card className="bg-light p-5 rounded">
        <Card.Body className="text-center">
          <h2 className="text-center mb-4">Sobre nosotros</h2>
          <p className="text-center lead">Conoce al equipo detrás de Gorras Premium</p>

          <h3 className="mt-4">Integrantes:</h3>
          <ListGroup variant="flush" className="mb-4">
            <ListGroup.Item>Castillo Merejildo Joshúa Javier</ListGroup.Item>
            <ListGroup.Item>Chuquipoma Vallejos Alexander Rodolfo </ListGroup.Item>
            <ListGroup.Item>Espinoza Fares Marlon Jorge </ListGroup.Item>
            <ListGroup.Item>Ligua Chavarria Liang Anderson </ListGroup.Item>
            <ListGroup.Item>Tomalá Tomalá Ofelia Jessica </ListGroup.Item>
          </ListGroup>

          <div className="row text-center">
            <div className="col-md-6 mb-3">
              <h3>Grupo:</h3>
              <p className="fs-5">Grupo N</p>
            </div>
            <div className="col-md-6 mb-3">
              <h3>Período:</h3>
              <p className="fs-5">2026</p>
            </div>
          </div>

          <div className="mt-4">
            <h3>Misión</h3>
            <p>
              Proveer gorras de la más alta calidad con diseños innovadores que 
              satisfagan las necesidades y gustos de nuestros clientes, 
              manteniendo siempre los mejores estándares de servicio.
            </p>
          </div>

          <div className="mt-4">
            <h3>Visión</h3>
            <p>
              Ser la empresa líder en venta de gorras a nivel nacional, 
              reconocida por nuestra calidad, innovación y compromiso 
              con la satisfacción del cliente.
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Acerca;