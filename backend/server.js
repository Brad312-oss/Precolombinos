import cors from 'cors'; // Middleware para habilitar CORS y permitir solicitudes desde otros dominios
import express from 'express'; // Framework para crear el servidor y manejar rutas
import path from 'path'; // Utilidad para manejar rutas de archivos y directorios
import { fileURLToPath } from 'url'; // Función para convertir URL de módulos a rutas de archivo
import dotenv from 'dotenv'; // Carga variables de entorno desde un archivo .env

dotenv.config(); // Carga las variables de entorno del archivo .env a process.env

const app = express(); // Crea la aplicación Express

app.use(cors()); // Habilita CORS para permitir solicitudes desde otros orígenes
app.use(express.json()); // Middleware para parsear JSON en el cuerpo de las solicitudes

// Sirve archivos estáticos (como imágenes) desde la carpeta 'uploads' cuando se accede a /uploads en la URL
app.use('/uploads', express.static('uploads'));

// Estas dos líneas permiten obtener la ruta absoluta del directorio actual (equivalente a __dirname en CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sirve archivos estáticos del frontend ubicado en la carpeta '../frontend' (normalmente HTML, CSS, JS)
// Esto permite servir directamente la interfaz de usuario desde el backend
app.use(express.static(path.join(__dirname, '../frontend')));

// Importación de rutas de diferentes módulos y las montamos en sus respectivos endpoints API

import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes); // Rutas relacionadas con autenticación (login, registro, etc.)

import piezaRoutes from './routes/piezaRoutes.js';
app.use('/api/piezas', piezaRoutes); // Rutas para manejar piezas

import ventaRoutes from './routes/ventaRoutes.js';
app.use('/api/ventas', ventaRoutes); // Rutas para manejar ventas

import productoRoutes from './routes/productoRoutes.js';
app.use('/api/productos', productoRoutes); // Rutas para productos

import culturaRoutes from './routes/culturaRoutes.js';
app.use('/api/culturas', culturaRoutes); // Rutas para culturas

import tamanioRoutes from './routes/tamanioRoutes.js';
app.use('/api/tamanios', tamanioRoutes); // Rutas para tamaños

import usuarioRoutes from './routes/usuarioRoutes.js';
app.use('/api/usuarios', usuarioRoutes); // Rutas para usuarios

import resenaRoutes from './routes/resenaRoutes.js';
app.use('/api/resenas', resenaRoutes); // Rutas para reseñas

// Ruta principal que responde con el archivo login.html ubicado en el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Arranca el servidor en el puerto 3000 y muestra un mensaje en consola cuando está listo
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});