import express from 'express';
import {
  listarTamanios,
  crearTamanio,
  eliminarTamanio
} from '../controllers/tamanioController.js';

import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para obtener todos los tamaños (acceso público)
router.get('/', listarTamanios);

// Ruta para crear un nuevo tamaño
// Requiere que el usuario esté autenticado y tenga rol 3 (administrador)
router.post('/', verificarUsuario, autorizarRoles([3]), crearTamanio);

// Ruta para eliminar un tamaño por su ID
// También requiere autenticación y rol 3
router.delete('/:id', verificarUsuario, autorizarRoles([3]), eliminarTamanio);

export default router;