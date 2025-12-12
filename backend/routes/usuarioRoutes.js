import express from 'express';
import {
  listarUsuarios,
  cambiarRolUsuario,
  editarUsuario,
  banearUsuario,
  eliminarUsuario,
  enviarCorreoUsuario,
  desbanearUsuario,
  obtenerClientes,
  obtenerEstadisticasUsuarios,
  actualizarPerfilCliente,
} from '../controllers/usuarioController.js';
import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Listar clientes (solo administradores)
router.get('/clientes', verificarUsuario, autorizarRoles([3]), obtenerClientes);

// Listar todos los usuarios (solo administradores)
router.get('/listar', verificarUsuario, autorizarRoles([3]), listarUsuarios);

// Cambiar el rol de un usuario (solo administradores)
router.put('/cambiar-rol', verificarUsuario, autorizarRoles([3]), cambiarRolUsuario);

// Editar datos de un usuario (solo administradores)
router.put('/editar', verificarUsuario, autorizarRoles([3]), editarUsuario);

// Banear a un usuario por ID (solo administradores)
router.put('/:usuario_id/banear', verificarUsuario, autorizarRoles([3]), banearUsuario);

// Eliminar un usuario por ID (solo administradores)
router.delete('/eliminar/:usuario_id', verificarUsuario, autorizarRoles([3]), eliminarUsuario);

// Enviar correo a un usuario (solo administradores)
router.post('/enviar-correo', verificarUsuario, autorizarRoles([3]), enviarCorreoUsuario);

// Desbanear a un usuario (solo administradores)
router.put('/desbanear', verificarUsuario, autorizarRoles([3]), desbanearUsuario);

// Obtener estadísticas de usuarios (solo administradores)
router.get('/reporte/usuarios', verificarUsuario, autorizarRoles([3]), obtenerEstadisticasUsuarios);

// Actualizar perfil de cliente (cualquier usuario autenticado)
router.put('/actualizar-perfil', verificarUsuario, actualizarPerfilCliente);

export default router;