require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario');
const Gorra = require('./models/Gorra');

const datosIniciales = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB para inserción de datos iniciales');

    // Verificar si ya existen usuarios
    const usuariosExistentes = await Usuario.countDocuments();
    
    if (usuariosExistentes === 0) {
      console.log('Insertando datos iniciales...');

      // Crear usuarios iniciales con cuenta_activa: true
      const usuarios = [
        {
          correo: 'adminCarlos@hotmail.com',
          contrasena: await bcrypt.hash('admin123', 12),
          nombre: 'Carlos',
          apellido: 'Alberto',
          cedula: '0999999999',
          telefono: '0943802926',
          direccion: 'Avenida de las americas',
          tipo: 'admin',
          cuenta_activa: true
        },
        {
          correo: 'bodegaMario@hotmail.com',
          contrasena: await bcrypt.hash('bodega123', 12),
          nombre: 'Mario',
          apellido: 'Garcia',
          cedula: '0888888888',
          telefono: '0913800016',
          direccion: 'Villa del rey',
          tipo: 'bodeguero',
          cuenta_activa: true
        },
        {
          correo: 'figueroa@hotmail.com',
          contrasena: await bcrypt.hash('cliente123', 12),
          nombre: 'Figueroa',
          apellido: 'Melissa',
          cedula: '0977777777',
          telefono: '0903800026',
          direccion: 'Cooperativa',
          tipo: 'cliente',
          cuenta_activa: true
        }
      ];

      await Usuario.insertMany(usuarios);
      console.log('Usuarios iniciales insertados correctamente');
    } else {
      console.log('Ya existen usuarios en la base de datos, omitiendo inserción');
    }

    // Verificar si ya existen gorras
    const gorrasExistentes = await Gorra.countDocuments();
    
    if (gorrasExistentes === 0) {
      // Crear gorras iniciales - RUTAS CORREGIDAS para el cliente
      const gorras = [
        {
          nombre: 'Gorra Deportiva Nike',
          tipo: 'deportiva',
          talla: 'M',
          color: 'Negro',
          precio: 25.99,
          descripcion: 'Gorra deportiva Nike para uso casual y deportivo',
          imagen: '/img/nike-deportiva.jpg', 
          stock: 50,
          disponible: true,
          destacada: true
        },
        {
          nombre: 'Gorra Elegante Fedora',
          tipo: 'elegante',
          talla: 'L',
          color: 'Marrón',
          precio: 35.50,
          descripcion: 'Gorra elegante estilo fedora para ocasiones especiales',
          imagen: '/img/fedora-elegante.jpg', 
          stock: 30,
          disponible: true,
          destacada: true
        },
        {
          nombre: 'Gorra Casual Adidas',
          tipo: 'casual',
          talla: 'S',
          color: 'Azul',
          precio: 22.75,
          descripcion: 'Gorra casual Adidas perfecta para el día a día',
          imagen: '/img/adidas-casual.jpg', 
          stock: 40,
          disponible: true,
          destacada: false
        },
        {
          nombre: 'Gorra Personalizada MLB',
          tipo: 'personalizada',
          talla: 'XL',
          color: 'Rojo',
          precio: 29.99,
          descripcion: 'Gorra personalizada de béisbol con logo MLB',
          imagen: '/img/mlb-personalizada.jpg', 
          stock: 25,
          disponible: true,
          destacada: true
        },
        {
          nombre: 'Gorra Deportiva Puma',
          tipo: 'deportiva',
          talla: 'L',
          color: 'Blanco',
          precio: 27.99,
          descripcion: 'Gorra deportiva Puma con diseño moderno',
          imagen: '/img/puma-deportiva.jpg', 
          stock: 35,
          disponible: true,
          destacada: false
        },
        {
          nombre: 'Gorra Casual Vans',
          tipo: 'casual',
          talla: 'M',
          color: 'Negro',
          precio: 24.50,
          descripcion: 'Gorra casual Vans para estilo urbano',
          imagen: '/img/vans-casual.jpg', 
          stock: 45,
          disponible: true,
          destacada: false
        }
      ];

      await Gorra.insertMany(gorras);
      console.log('Gorras iniciales insertadas correctamente');
    } else {
      console.log('Ya existen gorras en la base de datos, omitiendo inserción');
    }

    console.log('Datos iniciales insertados correctamente');
  } catch (error) {
    console.error('Error insertando datos iniciales:', error);
    throw error;
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  datosIniciales()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = datosIniciales;