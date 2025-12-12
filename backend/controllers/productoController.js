// Importamos funciones del modelo productoModel que permiten interactuar con la base de datos
import {
  obtenerProductos,
  agregarProducto as modeloAgregar,
  actualizarProducto as modeloActualizar,
  eliminarProducto as modeloEliminar
} from '../models/productoModel.js';

// Importamos el pool de conexiones para ejecutar consultas directas
import { pool } from '../config/db.js';

// Controlador para listar todos los productos
export const listarProductos = async (req, res) => {
  try {
    const productos = await obtenerProductos(); // Obtenemos productos desde el modelo
    res.json(productos); // Enviamos los productos al cliente
  } catch (error) {
    console.error('Error al obtener productos:', error); // En caso de error, lo mostramos en consola
    res.status(500).json({ message: 'Error al obtener productos' }); // Devolvemos error al cliente
  }
};

// Controlador para obtener el stock de un producto por ID
export const obtenerStockProducto = async (req, res) => {
  const { id } = req.params; // Obtenemos el ID del producto desde la URL

  try {
    const [rows] = await pool.query(
      'SELECT stock FROM productos WHERE producto_id = ?',
      [id]
    );

    // Si no se encuentra el producto, devolvemos 404
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Devolvemos el stock del producto encontrado
    res.json({ stock: rows[0].stock });
  } catch (error) {
    console.error('Error al obtener stock:', error);
    res.status(500).json({ message: 'Error al obtener stock' });
  }
};

// Controlador para agregar un nuevo producto
export const agregarProducto = async (req, res) => {
  // Extraemos datos del cuerpo del request
  const { piezas_id, cultura_id, tamanio_id, descripcion, precio, stock } = req.body;

  // Obtenemos la ruta del archivo de imagen si fue subida
  const imagen = req.file ? `/uploads/productos/${req.file.filename}` : null;

  // Capturamos el ID del usuario autenticado (quien está creando el producto)
  const usuarioId = req.usuario?.usuario_id;

  console.log('👤 ID del usuario autenticado (agregar):', usuarioId);

  // Verificamos que todos los campos sean enviados
  if (!piezas_id || !cultura_id || !tamanio_id || !descripcion || !precio || !stock || !imagen) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios, incluida la imagen' });
  }

  try {
    // Insertamos el producto en la base de datos usando el modelo
    const resultado = await modeloAgregar({
      piezas_id,
      cultura_id,
      tamanio_id,
      descripcion,
      precio,
      stock,
      imagen,
      modificado_por: usuarioId // Guardamos quién lo creó
    });

    // Respondemos con éxito
    res.status(201).json({ message: 'Producto agregado exitosamente' });
  } catch (error) {
    console.error('Error al agregar producto:', error.message);
    res.status(500).json({ message: 'Error al agregar producto', error: error.message });
  }
};

// Controlador para editar un producto existente
export const editarProducto = async (req, res) => {
  const { id } = req.params; // ID del producto a editar
  const {
    piezas_id,
    cultura_id,
    tamanio_id,
    descripcion,
    precio,
    stock
  } = req.body;

  // Ruta de imagen si fue actualizada
  const imagen = req.file ? `/uploads/productos/${req.file.filename}` : null;

  // ID del usuario que está modificando
  const usuarioId = req.usuario?.usuario_id;

  console.log('👤 ID del usuario autenticado (editar):', usuarioId);

  try {
    // Creamos el objeto con los datos actualizados
    const productoData = {
      piezas_id,
      cultura_id,
      tamanio_id,
      descripcion,
      precio,
      stock,
      imagen,
      modificado_por: usuarioId
    };

    // Si no se actualiza la imagen, la eliminamos del objeto
    if (!imagen) delete productoData.imagen;

    // Ejecutamos la actualización
    const resultado = await modeloActualizar(id, productoData);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar producto:', error);
    res.status(500).json({ message: 'Error al editar producto' });
  }
};

// Controlador para eliminar un producto por su ID
export const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await modeloEliminar(id); // Eliminamos desde el modelo

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

// Controlador para generar un reporte con detalles de todos los productos
export const obtenerReporteProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.producto_id,
        piezas.nombre_pieza AS nombre,
        p.stock,
        p.precio,
        p.estado,
        u.nombre AS admin_nombre,
        u.apellido AS admin_apellido,
        p.fecha_modificacion AS ultima_modificacion
      FROM productos p
      JOIN piezas ON p.piezas_id = piezas.piezas_id
      JOIN cultura ON p.cultura_id = cultura.cultura_id
      JOIN tamanio ON p.tamanio_id = tamanio.tamanio_id
      LEFT JOIN usuarios u ON p.modificado_por = u.usuario_id
      ORDER BY p.stock DESC;
    `);

    res.json({ productos }); // Enviamos los resultados como JSON
  } catch (error) {
    console.error('Error al obtener reporte de productos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Importamos función para obtener producto por su ID
import { obtenerProductoPorId } from '../models/productoModel.js';

// Controlador para obtener los detalles de un solo producto
export const obtenerProductoDetalle = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await obtenerProductoPorId(id); // Obtenemos el producto por ID

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(producto); // Respondemos con los datos del producto
  } catch (error) {
    console.error('Error al obtener detalle del producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};