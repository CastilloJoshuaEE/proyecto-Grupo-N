import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioStorage = localStorage.getItem('usuario');
    
    if (token && usuarioStorage) {
      setUsuario(JSON.parse(usuarioStorage));
    }
    
    setCargando(false);
  }, []);

const login = async (credenciales) => {
  try {
    const respuesta = await fetch(`${API_URL}/api/usuarios/login`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credenciales)
    });

    const datos = await respuesta.json();

    if (!datos.success) { 
      throw new Error(datos.message || datos.mensaje); 
    }

    localStorage.setItem('token', datos.data.token); 
    localStorage.setItem('usuario', JSON.stringify(datos.data));
    setUsuario(datos.data);

    // Disparar evento personalizado para forzar recarga del carrito
    window.dispatchEvent(new Event('loginSuccess'));
    
    toast.success('¡Inicio de sesión exitoso!');
    return datos;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

  const registro = async (datosUsuario) => {
    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios/registro`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
      });

      const datos = await respuesta.json();

      if (!datos.success) { 
        throw new Error(datos.message || datos.mensaje); 
      }

      localStorage.setItem('token', datos.data.token); 
      localStorage.setItem('usuario', JSON.stringify(datos.data));
      setUsuario(datos.data);

      toast.success('¡Registro exitoso!');
      return datos;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  setUsuario(null);
  
  // Limpiar el carrito del contexto
  // Necesitamos acceder al contexto del carrito para limpiarlo
  window.dispatchEvent(new Event('logout')); // Disparar evento personalizado
  toast.success('Sesión cerrada correctamente');
};

  const value = {
    usuario,
    cargando,
    login,
    registro,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};