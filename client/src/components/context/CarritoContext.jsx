import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const CarritoContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const useCarrito = () => {
  return useContext(CarritoContext);
};

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState({
    items: [],
    subtotal: 0,
    iva: 0,
    total: 0
  });
  const [inicializado, setInicializado] = useState(false);


  // Función para obtener carrito del backend
const obtenerCarritoBackend = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // Limpiar carrito si no hay token
      setCarrito({
        items: [],
        subtotal: 0,
        iva: 0,
        total: 0
      });
      setInicializado(true);
      return;
    }

    console.log('Obteniendo carrito del backend...');
    const respuesta = await fetch(`${API_URL}/api/carrito`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      console.log('Respuesta del backend:', datos);
      
      if (datos.success) {
        setCarrito(datos.data);
        console.log('Carrito cargado correctamente:', datos.data);
      } else {
        console.error('Error en la respuesta del backend:', datos.message);
        setCarrito({
          items: [],
          subtotal: 0,
          iva: 0,
          total: 0
        });
      }
    } else if (respuesta.status === 404) {
      console.log('No se encontró carrito, creando uno vacío');
      setCarrito({
        items: [],
        subtotal: 0,
        iva: 0,
        total: 0
      });
    } else if (respuesta.status === 401) {
      console.log('Token inválido, limpiando carrito');
      setCarrito({
        items: [],
        subtotal: 0,
        iva: 0,
        total: 0
      });
    } else {
      console.error('Error HTTP:', respuesta.status);
      setCarrito({
        items: [],
        subtotal: 0,
        iva: 0,
        total: 0
      });
    }
  } catch (error) {
    console.error('Error al obtener carrito del backend:', error);
    setCarrito({
      items: [],
      subtotal: 0,
      iva: 0,
      total: 0
    });
  } finally {
    setInicializado(true);
  }
}, []);
useEffect(() => {
  const handleLoginSuccess = () => {
    console.log('Login exitoso, obteniendo carrito...');
    obtenerCarritoBackend();
  };

  window.addEventListener('loginSuccess', handleLoginSuccess);
  
  return () => {
    window.removeEventListener('loginSuccess', handleLoginSuccess);
  };
}, [obtenerCarritoBackend]);
  // Obtener carrito al inicializar y cuando cambie el token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      obtenerCarritoBackend();
    } else {
      // Si no hay token, limpiar carrito
      setCarrito({
        items: [],
        subtotal: 0,
        iva: 0,
        total: 0
      });
      setInicializado(true);
    }
  }, [obtenerCarritoBackend, localStorage.getItem('token')]);

  // Manejar eventos de logout
  useEffect(() => {
    const handleLogout = () => {
      // Limpiar completamente el estado del carrito
      setCarrito({
        items: [],
        subtotal: 0,
        iva: 0,
        total: 0
      });
    };

    // Escuchar evento personalizado de logout
    window.addEventListener('logout', handleLogout);
    
    // Escuchar cambios en el storage (logout normal)
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        handleLogout(); // Limpiar carrito si no hay token
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const agregarAlCarrito = async (idProducto, cantidad = 1) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debe iniciar sesión para agregar productos al carrito');
        return;
      }

      const respuesta = await fetch(`${API_URL}/api/carrito/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id_gorra: idProducto,
          cantidad: cantidad 
        }) 
      });

      if (!respuesta.ok) {
        let errorMessage = 'Error al agregar producto al carrito';
        
        try {
          const errorData = await respuesta.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear la respuesta de error
        }
        
        throw new Error(errorMessage);
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setCarrito({
          items: datos.data.items || [],
          subtotal: datos.data.subtotal || 0,
          iva: datos.data.iva || 0,
          total: datos.data.total || 0
        });
        toast.success('Producto agregado al carrito');
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error(error.message || 'Error al agregar el producto al carrito');
    }
  };

  const actualizarCantidad = async (idItem, nuevaCantidad) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const respuesta = await fetch(`${API_URL}/api/carrito/items/${idItem}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cantidad: nuevaCantidad })
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || 'Error al actualizar cantidad');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setCarrito(prev => ({
          ...prev,
          items: datos.data.items || [],
          subtotal: datos.data.subtotal || 0,
          iva: datos.data.iva || 0,
          total: datos.data.total || 0
        }));
        toast.success('Cantidad actualizada');
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      toast.error(error.message);
    }
  };

  const eliminarDelCarrito = async (idItem) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const respuesta = await fetch(`${API_URL}/api/carrito/items/${idItem}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        if (datos.success) {
          setCarrito(prev => ({
            ...prev,
            items: datos.data.items || [],
            total: datos.data.total || 0
          }));
          toast.success('Producto eliminado del carrito');
        }
      }
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
    }
  };

  const vaciarCarrito = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const respuesta = await fetch(`${API_URL}/api/carrito`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        if (datos.success) {
          setCarrito({
            items: [],
            subtotal: 0,
            iva: 0,
            total: 0
          });
          toast.success('Carrito vaciado');
        }
      } else {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || 'Error al vaciar carrito');
      }
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      toast.error(error.message);
    }
  };

  const value = {
    carrito,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};