import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colorTema, setColorTema] = useState("rgb(51,72,92)");
  return (
    <ThemeContext.Provider value={{ colorTema, setColorTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);