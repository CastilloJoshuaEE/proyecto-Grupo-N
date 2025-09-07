import React from 'react';
import { ThemeProvider } from './components/context/ThemeContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Accesibilidad from './components/Accesibilidad'; // Importa el nuevo componente

// Componentes
import Dashboard from './components/admin/dashboard';
import Clientes from './components/admin/clientes';
import EditarCliente from './components/admin/editar_cliente';
import Pedidos from './components/admin/pedidos';
import Reportes from './components/admin/reportes';
import { AuthProvider } from './components/auth/AuthContext';
import FormularioGorras from './components/bodeguero/formulario_gorras';
import GestionGorras from './components/bodeguero/gestion_gorras';
import Carrito from './components/carrito/carrito';
import CompraExitosa from './components/carrito/compraExitosa';
import FinalizarCompra from './components/carrito/finalizarCompra';
import Catalogo from './components/catalogo/catalogo';
import Detalle from './components/catalogo/detalle';
import { CarritoProvider } from './components/context/CarritoContext';

import Acerca from './components/encabezado_pie/acerca';
import Encabezado from './components/encabezado_pie/encabezado';
import PiePagina from './components/encabezado_pie/pie_pagina';

import EditarPerfil  from './components/usuarios/editar_perfil';
import Login from './components/usuarios/login';
import CambiarContrasena from './components/usuarios/cambiar_contrasena';
import Perfil from './components/usuarios/perfil';
import Registro from  './components/usuarios/registro';

import HistorialPedidosCliente from './components/ventas/historialPedidosCliente';
import DetalleVenta from './components/ventas/detalle';
import Inicio from './components/Inicio';
import Pagina404 from './components/404';

// Estilos
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <CarritoProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            <Encabezado />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="*" element={<Pagina404 />} />

                <Route path="/login" element={<Login />} />
                 <Route path="/editar-perfil" element={<EditarPerfil />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
                <Route path="/recuperar-contrasena" element={<CambiarContrasena />} />

                <Route path="/historial-pedidos" element={<HistorialPedidosCliente />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/producto/:id" element={<Detalle />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/finalizar-compra" element={<FinalizarCompra />} />
                <Route path="/compra-exitosa" element={<CompraExitosa />} />

                <Route path="/compras/detalle/:id" element={<DetalleVenta />} />                
                <Route path="/acerca" element={<Acerca />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/clientes" element={<Clientes />} />
                <Route path="/admin/clientes/editar/:id" element={<EditarCliente />} />
                <Route path="/admin/pedidos" element={<Pedidos />} />
                <Route path="/admin/pedidos/detalle/:id" element={<DetalleVenta />} />
                <Route path="/admin/reportes" element={<Reportes />} />
                <Route path="/admin/gorras" element={<GestionGorras />} />
                <Route path="/admin/gorras/crear" element={<FormularioGorras />} />
                <Route path="/admin/gorras/editar/:id" element={<FormularioGorras />} />                
              </Routes>
            </main>
            <PiePagina />
            <Toaster position="top-right" />
            <Accesibilidad /> 
          </div>
        </Router>
      </CarritoProvider>
    </AuthProvider>
     </ThemeProvider>
  );
}

export default App;