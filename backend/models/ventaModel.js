// Importa la conexión a la base de datos
import pool from '../config/db.js';

// --------------------------------------------------------
// Inserta una nueva venta en la tabla 'ventas'
// --------------------------------------------------------
export const insertarVenta = async (usuario_id, fecha, total) => {
  const [result] = await pool.query(
    'INSERT INTO ventas (usuario_id, fecha, total) VALUES (?, ?, ?)',
    [usuario_id, fecha, total]
  );
  // Devuelve el ID de la venta recién creada
  return result.insertId;
};

// --------------------------------------------------------
// Inserta un detalle asociado a una venta específica
// --------------------------------------------------------
export const insertarDetalleVenta = async (venta_id, producto_id, cantidad, subtotal) => {
  await pool.query(
    'INSERT INTO detalle_de_venta (venta_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)',
    [venta_id, producto_id, cantidad, subtotal]
  );
};

// --------------------------------------------------------
// Actualiza el stock de un producto después de una venta
// --------------------------------------------------------
export const actualizarStockProducto = async (producto_id, cantidad) => {
  await pool.query(
    'UPDATE productos SET stock = stock - ? WHERE producto_id = ?',
    [cantidad, producto_id]
  );
};

// --------------------------------------------------------
// Obtiene el stock actual de un producto (con bloqueo de fila)
// --------------------------------------------------------
export const obtenerStockProducto = async (producto_id) => {
  const [rows] = await pool.query(
    'SELECT stock FROM productos WHERE producto_id = ? FOR UPDATE', // FOR UPDATE evita condiciones de carrera
    [producto_id]
  );
  return rows[0]; // Devuelve el stock actual
};

// --------------------------------------------------------
// Obtiene una lista de todas las ventas con información del cliente
// --------------------------------------------------------
export const obtenerVentasConDetalles = async () => {
  const [ventas] = await pool.query(`
    SELECT v.venta_id, v.fecha, v.total, u.nombre AS cliente
    FROM ventas v
    JOIN usuarios u ON v.usuario_id = u.usuario_id
    ORDER BY v.fecha DESC
  `);
  return ventas; // Lista de ventas ordenada por fecha
};

// --------------------------------------------------------
// Obtiene los detalles (productos vendidos) de una venta específica
// --------------------------------------------------------
export const obtenerDetallesVenta = async (venta_id) => {
  const [detalles] = await pool.query(`
    SELECT d.producto_id, p.nombre_pieza, d.cantidad, d.subtotal
    FROM detalle_de_venta d
    JOIN productos pr ON d.producto_id = pr.producto_id
    JOIN piezas p ON pr.piezas_id = p.piezas_id
    WHERE d.venta_id = ?
  `, [venta_id]);
  return detalles; // Devuelve los productos vendidos en esa venta
};

// --------------------------------------------------------
// Genera un reporte completo de todas las ventas con detalles
// --------------------------------------------------------
export const obtenerReporteVentas = async () => {
  const [reporte] = await pool.query(`
    SELECT 
      v.venta_id,
      v.fecha,
      v.estado,
      v.total,
      u.nombre AS cliente_nombre,
      u.apellido AS cliente_apellido,
      p.producto_id,
      p.descripcion,
      dv.cantidad,
      dv.subtotal
    FROM ventas v
    JOIN usuarios u ON v.usuario_id = u.usuario_id
    JOIN detalle_de_venta dv ON v.venta_id = dv.venta_id
    JOIN productos p ON dv.producto_id = p.producto_id
    ORDER BY v.fecha DESC
  `);
  return reporte; // Devuelve un reporte detallado de todas las ventas
};