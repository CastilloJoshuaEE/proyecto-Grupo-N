import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

const FormularioGorras = () => {
  const [gorra, setGorra] = useState({
    nombre: '',
    tipo: '',
    talla: '',
    color: '',
    precio: '',
    descripcion: '',
    stock: '',
    disponible: true,
    imagen: null
  });
  const [imagenPrevia, setImagenPrevia] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const esEdicion = !!id;

  useEffect(() => {
    if (esEdicion) {
      obtenerGorra();
    }
  }, [id]);

  useEffect(() => {
    if (usuario && !['admin', 'bodeguero'].includes(usuario.tipo)) {
      navigate('/login');
    }
  }, [usuario, navigate]);
const obtenerGorra = async () => {
  try {
    setCargando(true);
    const token = localStorage.getItem('token');
    const respuesta = await fetch(`${API_URL}/api/gorras/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!respuesta.ok) {
      throw new Error('Error al obtener gorra');
    }

    const datos = await respuesta.json();
    if (datos.success) {
      const gorraData = datos.data;
      setGorra({
        nombre: gorraData.nombre || '',
        tipo: gorraData.tipo || '',
        talla: gorraData.talla || '',
        color: gorraData.color || '',
        precio: gorraData.precio?.toString() || '',
        descripcion: gorraData.descripcion || '',
        stock: gorraData.stock?.toString() || '',
        disponible: gorraData.disponible ?? true,
        imagen: gorraData.imagen // ← Mantener la ruta completa de la imagen
      });
      if (gorraData.imagen) {
        setImagenPrevia(`${API_URL}${gorraData.imagen}`); // ← Usar URL completa
      }
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    setCargando(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGorra(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
const handleImagenChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Para nueva imagen, guardar el archivo completo
    setGorra(prev => ({ ...prev, imagen: file }));
    
    // Crear URL previa para la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagenPrevia(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};
const handleSubmit = async (e) => {
  e.preventDefault();
  setGuardando(true);

  try {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('nombre', gorra.nombre);
    formData.append('tipo', gorra.tipo);
    formData.append('talla', gorra.talla);
    formData.append('color', gorra.color);
    formData.append('precio', gorra.precio);
    formData.append('stock', gorra.stock);
    formData.append('descripcion', gorra.descripcion);
    formData.append('disponible', gorra.disponible);
    
    // Solo agregar imagen si es un archivo (nueva imagen)
    if (gorra.imagen instanceof File) {
      formData.append('imagen', gorra.imagen);
    }

    const url = esEdicion 
      ? `${API_URL}/api/admin/gorras/${id}`
      : `${API_URL}/api/admin/gorras`;
    
    const method = esEdicion ? 'PUT' : 'POST';

    const respuesta = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO establecer Content-Type para FormData
      },
      body: formData
    });

    // Verificar si la respuesta es JSON
    const contentType = respuesta.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await respuesta.text();
      console.error('Respuesta no JSON:', text);
      throw new Error('El servidor devolvió una respuesta inesperada');
    }

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.message || `Error ${respuesta.status}`);
    }

    if (datos.success) {
      toast.success(esEdicion ? 'Gorra actualizada exitosamente' : 'Gorra creada exitosamente');
      navigate('/admin/gorras');
    }
  } catch (error) {
    toast.error(error.message);
    console.error('Error detallado:', error);
  } finally {
    setGuardando(false);
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
      <h1 className="mb-4 text-center">
        {esEdicion ? 'Editar Gorra' : 'Registrar Nueva Gorra'}
      </h1>

      <Card className="p-4">
        <Form onSubmit={handleSubmit}>
          {/* Imagen */}
          <Form.Group className="mb-3">
            <Form.Label>Imagen de la gorra</Form.Label>
            {imagenPrevia && (
              <div className="mb-3">
                <img 
                  src={imagenPrevia} 
                  alt="Vista previa" 
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                  className="img-thumbnail"
                />
              </div>
            )}
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
            />
          </Form.Group>

          {/* Nombre */}
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={gorra.nombre}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          {/* Tipo */}
          <Form.Group className="mb-3">
            <Form.Label>Tipo de gorra</Form.Label>
            <Form.Select
              name="tipo"
              value={gorra.tipo}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un tipo</option>
              <option value="deportiva">Deportiva</option>
              <option value="elegante">Elegante</option>
              <option value="casual">Casual</option>
              <option value="personalizada">Personalizada</option>
            </Form.Select>
          </Form.Group>

          {/* Talla */}
          <Form.Group className="mb-3">
            <Form.Label>Talla</Form.Label>
            <Form.Select
              name="talla"
              value={gorra.talla}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione una talla</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </Form.Select>
          </Form.Group>

          {/* Color */}
          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="text"
              name="color"
              value={gorra.color}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          {/* Precio */}
          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="precio"
              value={gorra.precio}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          {/* Stock */}
          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              name="stock"
              min="0"
              value={gorra.stock}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          {/* Descripción */}
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={gorra.descripcion}
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* Disponible */}
          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              name="disponible"
              label="Disponible"
              checked={gorra.disponible}
              onChange={handleInputChange}
            />
            <Form.Text className="text-muted">
              En el caso de marcar una gorra como No disponible, 
              esta se eliminará tanto del catálogo como del listado 
              de gorras disponibles.
            </Form.Text>
          </Form.Group>

          <Button
            type="submit"
            variant="success"
            className="w-100"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : (esEdicion ? 'Actualizar Gorra' : 'Agregar Gorra')}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <Link to="/admin/gorras" className="btn btn-secondary">
            ⬅ Volver a gestión de gorras
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default FormularioGorras;