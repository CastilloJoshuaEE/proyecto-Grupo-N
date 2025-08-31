import React, { useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CompraExitosa = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idVenta = searchParams.get('id');

  useEffect(() => {
    if (!idVenta) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      navigate(`/compras/detalle/${idVenta}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [idVenta, navigate]);

  return (
    <Container className="my-5">
      <div className="text-center">
        <div className="card p-5 shadow">
          <div className="card-body">
            <h2 className="text-success mb-4">¡Compra realizada con éxito!</h2>
            <p className="lead">Estamos procesando su pedido y generando la factura.</p>
            <p>Será redirigido automáticamente al detalle de su compra.</p>
            
            <div className="mt-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CompraExitosa;