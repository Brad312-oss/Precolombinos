// Importa express para manejar rutas
import express from 'express';

// Importa los controladores para productos
import {
  listarProductos,
  obtenerStockProducto,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  obtenerReporteProductos,
  obtenerProductoDetalle
} from '../controllers/productoController.js';

// Importa middleware para autenticación y autorización
import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';

// Importa middleware para manejo de subida de archivos (imágenes)
import { upload } from '../middleware/uploadMiddleware.js';

// Crea un router de Express
const router = express.Router();

// --------------------------------------
// Ruta GET para obtener reporte de productos
// Solo accesible para usuarios autenticados con rol 3 (admin)
// --------------------------------------
router.get('/reporte/productos', verificarUsuario, autorizarRoles([3]), obtenerReporteProductos);

// --------------------------------------
// Ruta GET para listar todos los productos (acceso público)
// --------------------------------------
router.get('/', listarProductos);

// --------------------------------------
// Ruta GET para obtener el stock de un producto por su ID (acceso público)
// --------------------------------------
router.get('/stock/:id', obtenerStockProducto);

// --------------------------------------
// Ruta DELETE para eliminar un producto por ID
// Requiere autenticación y rol 3
// --------------------------------------
router.delete(
  '/:id',
  verificarUsuario,
  autorizarRoles([3]),
  eliminarProducto
);

// --------------------------------------
// Ruta POST para agregar un nuevo producto
// Requiere autenticación y rol 3
// Usa middleware upload para subir imagen
// --------------------------------------
router.post(
  '/',
  verificarUsuario,
  autorizarRoles([3]),
  upload.single('imagen'),  // Procesa archivo 'imagen' enviado en la petición
  agregarProducto
);

// --------------------------------------
// Ruta PUT para editar un producto por ID
// Requiere autenticación y rol 3
// Permite subir nueva imagen también
// --------------------------------------
router.put(
  '/:id',
  verificarUsuario,
  autorizarRoles([3]),
  upload.single('imagen'),
  editarProducto
);

// --------------------------------------
// Ruta GET para obtener detalle de un producto por su ID (acceso público)
// --------------------------------------
router.get('/:id', obtenerProductoDetalle);

// Exporta el router para usarlo en la app principal
export default router;