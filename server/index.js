require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // Importar el paquete CORS
const routes = require('./routes/routes');
const datosIniciales = require('./seed'); // Importar el script de inicialización

const app = express();

// Configurar CORS 
app.use(cors({
  origin: ['http://localhost:3000', 'https://proyecto-grupo-n-frontend.onrender.com'],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta client (para desarrollo)
app.use('/img', express.static(path.join(__dirname, '../client/public/img')));

// Servir archivos estáticos desde build (para producción)
app.use(express.static(path.join(__dirname, '../client/build')));

// Conectar a MongoDB y ejecutar datos iniciales
const iniciarServidor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Ejecutar datos iniciales
    await datosIniciales();

    // Usar rutas
    app.use('/api', routes);

    // Ruta para servir la aplicación React (para producción)
    if (process.env.NODE_ENV === 'production') {
      // Sirve archivos estáticos del build de React
      app.use(express.static(path.join(__dirname, 'client/build')));
      
      // Maneja todas las demás rutas devolviendo el index.html
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
      });
    }
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
      console.log(`API disponible en: http://localhost:${PORT}/api`);
      console.log(`Endpoints principales:`);
      console.log(`- GET  http://localhost:${PORT}/api/gorras`);
      console.log(`- POST http://localhost:${PORT}/api/usuarios/login`);
      console.log(`- POST http://localhost:${PORT}/api/usuarios/registro`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();