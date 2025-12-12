// Importa express para crear el router
import express from 'express';

// Importa los controladores para manejar las piezas
import {
  listarPiezas,
  crearPieza,
  eliminarPieza
} from '../controllers/piezaController.js';

// Importa middleware para verificar autenticación y autorizar roles
import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';

// Crea una instancia de router de Express
const router = express.Router();

// -------------------------------------------------------------
// Ruta GET /api/piezas
// Obtiene la lista de piezas disponibles (acceso público)
// -------------------------------------------------------------
router.get('/', listarPiezas);

// -------------------------------------------------------------
// Ruta POST /api/piezas
// Crea una nueva pieza (solo usuarios autenticados con rol 3)
// -------------------------------------------------------------
router.post(
  '/', 
  verificarUsuario,          // Verifica que el usuario esté autenticado
  autorizarRoles([3]),       // Permite solo al rol 3 (ej. administrador)
  crearPieza                 // Controlador que crea la pieza en BD
);

// -------------------------------------------------------------
// Ruta DELETE /api/piezas/:id
// Elimina una pieza por ID (solo usuarios autenticados con rol 3)
// -------------------------------------------------------------
router.delete(
  '/:id', 
  verificarUsuario,          // Verifica autenticación
  autorizarRoles([3]),       // Permite solo rol 3
  eliminarPieza              // Controlador que elimina la pieza
);

// Exporta el router para que pueda ser usado en la app principal
export default router;