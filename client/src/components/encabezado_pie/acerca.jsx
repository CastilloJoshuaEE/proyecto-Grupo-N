import React from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';

const Acerca = () => {
  return (
    <Container className="my-5">
      <Card className="bg-light p-5 rounded">
        <Card.Body className="text-center">
          <h2 className="text-center mb-4">Sobre nosotros</h2>
          <p className="text-center lead">Conoce al equipo detrás de Kawsay Caps S.A.</p>

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
              <p className="fs-5">2025</p>
            </div>
          </div>

          <div className="mt-4">
            <h3>Misión</h3>
            <p>
              Inspirar orgullo y amor por nuestra cultura ecuatoriana a través de gorras urbanas de alta calidad, con diseños innovadores 
              y eslóganes que transmitan identidad, emoción y pertenencia. Nos comprometemos a ofrecer un producto que conecte con las raíces, 
              acompañe el estilo de vida de nuestra gente y sea un símbolo de unidad y autenticidad.
            </p>
          </div>

          <div className="mt-4">
            <h3>Visión</h3>
            <p>
              Convertirnos en la marca referente de gorras con identidad ecuatoriana 
              a nivel nacional e internacional, reconocida por su creatividad, 
              calidad y capacidad de transmitir en cada diseño la esencia de nuestra tierra. 
              Queremos que cada persona que lleve una de nuestras gorras se sienta embajadora de la cultura ecuatoriana 
              en cualquier parte del mundo.
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Acerca;