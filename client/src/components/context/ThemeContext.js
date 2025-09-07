import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colorTema, setColorTema] = useState(() => {
    // Intentar obtener el tema guardado en localStorage
    const savedTheme = localStorage.getItem('themeColor');
    return savedTheme || "rgb(51,72,92)"; // Valor por defecto
  });

  // Efecto para guardar el tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('themeColor', colorTema);
    
    // Aplicar el tema a todo el documento
    document.documentElement.style.setProperty('--brand', colorTema);
    document.documentElement.style.setProperty('--brand-dark', 
      colorTema === "#000000" ? "#333333" : 
      colorTema === "#00BFFF" ? "#0080FF" : 
      "rgb(41,58,74)");
  }, [colorTema]);

  return (
    <ThemeContext.Provider value={{ colorTema, setColorTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);