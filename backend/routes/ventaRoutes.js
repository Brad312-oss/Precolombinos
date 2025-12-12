import express from 'express';
import {
  crearVenta,
  listarVentasConDetalles,
  actualizarEstadoVenta,
  obtenerVentas,
  generarReporteFiltrado
} from '../controllers/ventaController.js';

import {
  verificarUsuario,
  autorizarRoles
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Obtener todas las ventas (solo administradores)
router.get('/ventas', verificarUsuario, autorizarRoles([3]), obtenerVentas);

// Listar detalles de ventas (solo administradores)
router.get('/detalles', verificarUsuario, autorizarRoles([3]), listarVentasConDetalles);

// Actualizar el estado de una venta por ID (solo administradores)
router.put('/actualizar-estado/:venta_id', verificarUsuario, autorizarRoles([3]), actualizarEstadoVenta);

// Generar reporte filtrado de ventas (solo administradores)
router.get('/reporte/filtrado', verificarUsuario, autorizarRoles([3]), generarReporteFiltrado);

// Crear una nueva venta (usuarios autenticados)
router.post('/', verificarUsuario, crearVenta);

export default router;