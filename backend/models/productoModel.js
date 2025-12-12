// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';

// ---------------------------------------------
// Obtener todos los productos disponibles
// ---------------------------------------------
export const obtenerProductos = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.producto_id,
      p.descripcion,
      p.imagen,
      p.precio,
      p.stock,
      c.cultura,
      pi.nombre_pieza,
      t.tamanio
    FROM productos p
    JOIN cultura c ON p.cultura_id = c.cultura_id
    JOIN piezas pi ON p.piezas_id = pi.piezas_id
    JOIN tamanio t ON p.tamanio_id = t.tamanio_id
    WHERE p.estado = 'disponible' -- Filtra solo los productos activos o disponibles
  `);
  return rows; // Devuelve un arreglo con los productos encontrados
};

// ---------------------------------------------
// Agregar un nuevo producto a la base de datos
// ---------------------------------------------
export const agregarProducto = async ({ piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen, modificado_por }) => {
  const [result] = await pool.query(
    `INSERT INTO productos 
    (piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen, fecha_modificacion, modificado_por) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen, modificado_por]
  );
  return result; // Devuelve el resultado de la inserción (incluye insertId, etc.)
};

// ---------------------------------------------
// Actualizar información de un producto existente
// ---------------------------------------------
export const actualizarProducto = async (id, datos) => {
  // Si no se reciben datos, se lanza un error
  if (!datos || Object.keys(datos).length === 0) {
    throw new Error('No se proporcionaron datos para actualizar');
  }

  // Se preparan los campos y valores dinámicamente para armar la consulta SQL
  const campos = [];
  const valores = [];

  for (const [clave, valor] of Object.entries(datos)) {
    campos.push(`${clave} = ?`);
    valores.push(valor);
  }

  // Se agrega la fecha de modificación automáticamente
  campos.push('fecha_modificacion = NOW()');
  valores.push(id); // Se agrega el ID al final para la cláusula WHERE

  const [result] = await pool.query(
    `UPDATE productos SET ${campos.join(', ')} WHERE producto_id = ?`,
    valores
  );

  return result; // Devuelve el resultado de la actualización
};

// ---------------------------------------------
// Eliminar un producto por su ID
// ---------------------------------------------
export const eliminarProducto = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM productos WHERE producto_id = ?',
    [id]
  );
  return result; // Devuelve cuántas filas fueron eliminadas
};

// ---------------------------------------------
// Obtener un producto específico por su ID
// ---------------------------------------------
export async function obtenerProductoPorId(id) {
  const [rows] = await pool.query(`
    SELECT 
      p.producto_id,
      piezas.nombre_pieza AS pieza,
      cultura.cultura AS cultura,
      tamanio.tamanio AS tamanio,
      p.descripcion,
      p.imagen,
      p.precio,
      p.stock,
      p.estado
    FROM productos p
    JOIN piezas ON p.piezas_id = piezas.piezas_id
    JOIN cultura ON p.cultura_id = cultura.cultura_id
    JOIN tamanio ON p.tamanio_id = tamanio.tamanio_id
    WHERE p.producto_id = ?
  `, [id]);

  return rows[0]; // Devuelve un solo producto (el primero que coincida)
}