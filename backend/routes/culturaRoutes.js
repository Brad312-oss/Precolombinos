// Importa express para crear rutas
import express from 'express';

// Importa las funciones del controlador de cultura
import {
  listarCulturas,
  crearCultura,
  eliminarCultura
} from '../controllers/culturaController.js';

// Importa los middlewares para verificar autenticación y autorización por rol
import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';

// Crea una instancia de router de Express
const router = express.Router();

// -------------------------------------------------------------
// Ruta GET /api/culturas
// Lista todas las culturas existentes
// -------------------------------------------------------------
router.get('/', listarCulturas);

// -------------------------------------------------------------
// Ruta POST /api/culturas
// Crea una nueva cultura (solo accesible por usuarios con rol 3)
// -------------------------------------------------------------
router.post('/', 
  verificarUsuario,           // Verifica que el usuario esté autenticado
  autorizarRoles([3]),        // Solo permite rol con ID 3 (ej: administrador)
  crearCultura                // Controlador que inserta la cultura
);

// -------------------------------------------------------------
// Ruta DELETE /api/culturas/:id
// Elimina una cultura por ID (solo accesible por usuarios con rol 3)
// -------------------------------------------------------------
router.delete('/:id', 
  verificarUsuario,           // Verifica autenticación
  autorizarRoles([3]),        // Restringe a ciertos roles
  eliminarCultura             // Controlador que elimina la cultura
);

// Exporta el router para ser usado en el archivo principal de rutas
export default router;