import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (usuario && usuario.tipo === 'admin') {
      obtenerPedidos();
    }
  }, [usuario]);

  const obtenerPedidos = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL}/api/admin/ventas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error('Error al obtener pedidos');
      }

      const datos = await respuesta.json();
      if (datos.success) {
        setPedidos(datos.data);
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
      <h2 className="mb-4">Historial de pedidos</h2>

      {pedidos.length === 0 ? (
        <Alert variant="info">No hay pedidos registrados.</Alert>
      ) : (
        <Table responsive className="tabla-factura">
          <thead>
            <tr>
              <th>Factura</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido._id}>
                <td>#{pedido.factura?.numero_factura || pedido._id}</td>
                <td>
                  {pedido.id_usuario?.nombre} {pedido.id_usuario?.apellido}
                </td>
                <td>{new Date(pedido.fecha_venta).toLocaleDateString()}</td>
                <td>${pedido.total.toFixed(2)}</td>
                <td>
                  <Link
                    to={`/compras/detalle/${pedido._id}`}
                    className="btn btn-info btn-sm"
                  >
                    🔍 Ver detalle
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

export default Pedidos;