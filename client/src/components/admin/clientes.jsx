import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL  || 'http://localhost:5001';

  useEffect(() => {
    if (usuario && usuario.tipo === 'admin') {
      obtenerClientes();
    }
  }, [usuario]);

  const obtenerClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/admin/clientes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error('Error al obtener clientes');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setClientes(datos.data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4">Usuarios registrados</h2>

      {clientes.length === 0 ? (
        <Alert variant="info">No hay usuarios registrados.</Alert>
      ) : (
        <Table responsive className="tabla-factura">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente._id}>
                <td>{cliente.nombre} {cliente.apellido}</td>
                <td>{cliente.correo}</td>
                <td>{cliente.telefono || 'N/A'}</td>
                <td>{cliente.direccion || 'N/A'}</td>
                <td>
                  <Link
                    to={`/admin/clientes/editar/${cliente._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    ✏️ Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="mt-4">
        <Link to="/admin/dashboard" className="btn btn-secondary">
          ⬅ Volver al panel
        </Link>
      </div>
    </Container>
  );
};

export default Clientes;