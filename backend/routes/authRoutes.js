// Importa Express para manejar rutas
import express from 'express';

// Importa las funciones del controlador de autenticación
import {
  login,
  register,
  solicitarRecuperacion,
  cambiarContrasena
} from '../controllers/authController.js';

// Importa el middleware que verifica si el token JWT es válido
import { verificarUsuario } from '../middleware/authMiddleware.js';

// Crea una instancia de router de Express
const router = express.Router();

// ------------------------------------------------------------
// Ruta para registrar un nuevo usuario
// ------------------------------------------------------------
router.post('/register', register);
// Llama a la función 'register' del controlador cuando se hace POST a /auth/register

// ------------------------------------------------------------
// Ruta para iniciar sesión
// ------------------------------------------------------------
router.post('/login', login);
// Llama a 'login' para verificar credenciales y devolver un token JWT

// ------------------------------------------------------------
// Ruta para solicitar recuperación de contraseña
// ------------------------------------------------------------
router.post('/solicitar-recuperacion', solicitarRecuperacion);
// Aquí se podría enviar un correo de recuperación (pendiente en backend)

// ------------------------------------------------------------
// Ruta para cambiar la contraseña (normalmente después de recuperación)
// ------------------------------------------------------------
router.post('/cambiar-contrasena', cambiarContrasena);

// ------------------------------------------------------------
// Ruta protegida para verificar si el usuario está autenticado
// ------------------------------------------------------------
router.get('/verificar', verificarUsuario, (req, res) => {
  // Si el token es válido, retorna los datos del usuario desde req.usuario
  res.json({ usuario: req.usuario });
});

// ------------------------------------------------------------
// Exporta el router para que pueda ser usado en la app principal
// ------------------------------------------------------------
export default router;
