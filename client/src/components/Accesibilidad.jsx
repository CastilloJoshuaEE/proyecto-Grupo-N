import React, { useState, useEffect } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { FaUniversalAccess, FaFont, FaTextHeight, FaArrowsAltV, FaUndo } from 'react-icons/fa';
import { FaPalette } from 'react-icons/fa';
import { useTheme } from './context/ThemeContext';
import '../assets/css/Accesibilidad.css';

const Accesibilidad = () => {
  const [tamanoTexto, setTamanoTexto] = useState(100);
  const [espaciadoTexto, setEspaciadoTexto] = useState(100);
  const [alturaLinea, setAlturaLinea] = useState(150);
  const [grayscale, setGrayscale] = useState(false); // 🌑 estado para tonos grises
  const { setColorTema } = useTheme(); 
  // Aplicar estilos excluyendo el componente de accesibilidad
  const aplicarEstilos = () => {
    const root = document.documentElement;
    root.style.setProperty('--tamano-texto', `${tamanoTexto}%`);
    root.style.setProperty('--espaciado-texto', `${espaciadoTexto}%`);
    root.style.setProperty('--altura-linea', `${alturaLinea}%`);
     // Aplicar o quitar filtro de grises
    // Aplicar o quitar filtro de grises excluyendo modales
    if (grayscale) {
      // Crear un contenedor para todo el contenido excepto modales
      const mainContent = document.querySelector('main, header, footer');
      if (mainContent) {
        mainContent.style.filter = 'grayscale(100%)';
      }
      
      // Asegurarse de que los modales no tengan filtro
      const modals = document.querySelectorAll('.modal, .modal-content, .modal-backdrop');
      modals.forEach(modal => {
        modal.style.filter = 'none';
      });
    } else {
      // Quitar filtro de grises
      const mainContent = document.querySelector('main, header, footer');
      if (mainContent) {
        mainContent.style.filter = '';
      }
    }


    // Aplicar estilos a todos los elementos de texto EXCLUYENDO el componente de accesibilidad
    const elementosTexto = document.querySelectorAll(`
      body, 
      p, 
      span, 
      div:not(.accesibilidad-container):not(.accesibilidad-container *), 
      h1, 
      h2, 
      h3, 
      h4, 
      h5, 
      h6, 
      a, 
      li, 
      td, 
      th,
      .btn:not(.accesibilidad-container .btn),
      .form-control:not(.accesibilidad-container .form-control)
    `);
    
    elementosTexto.forEach(el => {
      // Solo aplicar si no está dentro del contenedor de accesibilidad
      if (!el.closest('.accesibilidad-container')) {
        el.style.fontSize = `${tamanoTexto}%`;
        el.style.letterSpacing = `${(espaciadoTexto - 100) / 100}em`;
        el.style.lineHeight = `${alturaLinea}%`;
      }
    });
  };

  // Restablecer estilos excluyendo el componente de accesibilidad
  const restablecerTodo = () => {
    setTamanoTexto(100);
    setEspaciadoTexto(100);
    setAlturaLinea(150);
    setGrayscale(false);

    setTimeout(() => {
      const root = document.documentElement;
      root.style.removeProperty('--tamano-texto');
      root.style.removeProperty('--espaciado-texto');
      root.style.removeProperty('--altura-linea');

      const mainContent = document.querySelector('main, header, footer');
      if (mainContent) {
        mainContent.style.filter = '';
      }
      const elementosTexto = document.querySelectorAll(`
        body, 
        p, 
        span, 
        div:not(.accesibilidad-container):not(.accesibilidad-container *), 
        h1, 
        h2, 
        h3, 
        h4, 
        h5, 
        h6, 
        a, 
        li, 
        td, 
        th,
        .btn:not(.accesibilidad-container .btn),
        .form-control:not(.accesibilidad-container .form-control)
      `);
      
      elementosTexto.forEach(el => {
        if (!el.closest('.accesibilidad-container')) {
          el.style.fontSize = '';
          el.style.letterSpacing = '';
          el.style.lineHeight = '';
        }
      });
    }, 100);
  };

  // Aplicar estilos cuando cambian los valores
  useEffect(() => {
    aplicarEstilos();
  }, [tamanoTexto, espaciadoTexto, alturaLinea, grayscale]);

  const aumentarTamanoTexto = () => {
    setTamanoTexto(prev => Math.min(prev + 10, 150));
  };

  const disminuirTamanoTexto = () => {
    setTamanoTexto(prev => Math.max(prev - 10, 80));
  };

  const aumentarEspaciadoTexto = () => {
    setEspaciadoTexto(prev => Math.min(prev + 10, 150));
  };

  const disminuirEspaciadoTexto = () => {
    setEspaciadoTexto(prev => Math.max(prev - 10, 80));
  };

  const aumentarAlturaLinea = () => {
    setAlturaLinea(prev => Math.min(prev + 10, 200));
  };

  const disminuirAlturaLinea = () => {
    setAlturaLinea(prev => Math.max(prev - 10, 120));
  };

  return (
    <div className="accesibilidad-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Dropdown>
        <Dropdown.Toggle 
          variant="primary" 
          id="dropdown-accesibilidad"
          className="d-flex align-items-center accesibilidad-toggle"
        >
          <FaUniversalAccess size={24} />
        </Dropdown.Toggle>

        <Dropdown.Menu 
          align="end"
          className="accesibilidad-menu"
        >
          <div className="mb-3">
            <h6 className="d-flex align-items-center accesibilidad-title">
              <FaFont className="me-2" />
              Tamaño del texto
            </h6>
            <div className="d-flex justify-content-between align-items-center">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={disminuirTamanoTexto}
                disabled={tamanoTexto <= 80}
                className="accesibilidad-btn"
              >
                -
              </Button>
              <span className="mx-2 accesibilidad-value">{tamanoTexto}%</span>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={aumentarTamanoTexto}
                disabled={tamanoTexto >= 150}
                className="accesibilidad-btn"
              >
                +
              </Button>
            </div>
          </div>

          <div className="mb-3">
            <h6 className="d-flex align-items-center accesibilidad-title">
              <FaTextHeight className="me-2" />
              Espaciado del texto
            </h6>
            <div className="d-flex justify-content-between align-items-center">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={disminuirEspaciadoTexto}
                disabled={espaciadoTexto <= 80}
                className="accesibilidad-btn"
              >
                -
              </Button>
              <span className="mx-2 accesibilidad-value">{espaciadoTexto}%</span>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={aumentarEspaciadoTexto}
                disabled={espaciadoTexto >= 150}
                className="accesibilidad-btn"
              >
                +
              </Button>
            </div>
          </div>

          <div className="mb-3">
            <h6 className="d-flex align-items-center accesibilidad-title">
              <FaArrowsAltV className="me-2" />
              Altura de línea
            </h6>
            <div className="d-flex justify-content-between align-items-center">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={disminuirAlturaLinea}
                disabled={alturaLinea <= 120}
                className="accesibilidad-btn"
              >
                -
              </Button>
              <span className="mx-2 accesibilidad-value">{alturaLinea}%</span>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={aumentarAlturaLinea}
                disabled={alturaLinea >= 200}
                className="accesibilidad-btn"
              >
                +
              </Button>
            </div>
          </div>

        {/* 🎨 Selector de color */}
        <div className="mb-3">
        <h6 className="d-flex align-items-center accesibilidad-title">
            <FaPalette className="me-2 text-primary" size={18} />
            Colores del tema
        </h6>
        <div className="d-flex gap-2">
            <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={() => setColorTema("rgb(51,72,92)")}
            >
            🔵 Azul
            </Button>
            <Button 
            variant="outline-dark" 
            size="sm" 
            onClick={() => setColorTema("#000000")}
            >
            ⚫ Negro
            </Button>
            <Button 
            variant="outline-info" 
            size="sm" 
            onClick={() => setColorTema("#00BFFF")}
            >
            🔵 Celeste
            </Button>
        </div>
        </div>
        {/* 🌑 Tonos grises */}
        <div className="mb-3">
            <h6 className="d-flex align-items-center accesibilidad-title">
              🌑 Filtros visuales
            </h6>
            <Button 
              variant={grayscale ? "secondary" : "outline-secondary"} 
              size="sm"
              onClick={() => setGrayscale(!grayscale)}
            >
              {grayscale ? "Desactivar grises" : "Aplicar grises"}
            </Button>
        </div>
          

          <hr className="accesibilidad-divider" />

          <div className="text-center">
            <Button 
              variant="outline-danger" 
              onClick={restablecerTodo}
              className="d-flex align-items-center justify-content-center mx-auto accesibilidad-reset"
            >
              <FaUndo className="me-2" />
              Restablecer valores por defecto
            </Button>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default Accesibilidad;