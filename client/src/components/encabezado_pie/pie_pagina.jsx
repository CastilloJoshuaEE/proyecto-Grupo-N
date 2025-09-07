import React from 'react';
import { Container } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const PiePagina = () => {
  const { colorTema } = useTheme();
  return (
    <footer className="text-white py-4 mt-5 custom-footer" style={{ backgroundColor: 'var(--brand)' }}>
      <Container className="text-center">
        <p>&copy; 2025 Proyecto educativo con stack: MERN - Grupo N. 
        Todos los derechos reservados.</p>
        <p className="mb-0">Integrantes: Castillo, Chuquipoma, Espinoza, Ligua, Tomalá </p>
      </Container>
    </footer>
  );
};

export default PiePagina;