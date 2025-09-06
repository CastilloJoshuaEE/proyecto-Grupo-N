import React from 'react';
import { Container } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const PiePagina = () => {
  const { colorTema } = useTheme();
  return (
    <footer
      className="text-white py-4 mt-5 custom-footer"
      style={{ backgroundColor: colorTema }}
    >
      <Container className="text-center">
        <p>&copy; 2026 Proyecto con stack de Mern - Grupo N. 
        Todos los derechos reservados.</p>
        <p className="mb-0">Integrantes: Castillo, Chuquipoma, Espinoza, Ligua, Tomalá </p>
      </Container>
    </footer>
  );
};

export default PiePagina;