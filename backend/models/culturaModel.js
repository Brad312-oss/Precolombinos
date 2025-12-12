// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';

// Función para obtener todas las culturas registradas en la base de datos
export const obtenerCulturas = async () => {
  // Realiza una consulta SQL para seleccionar todos los registros de la tabla 'cultura'
  const [rows] = await pool.query('SELECT * FROM cultura');
  // Devuelve el resultado de la consulta (todas las culturas)
  return rows;
};

// Función para insertar una nueva cultura en la base de datos
export const insertarCultura = async (cultura) => {
  // Inserta un nuevo registro en la tabla 'cultura'
  await pool.query('INSERT INTO cultura (cultura) VALUES (?)', [cultura]);
};

// Función para borrar una cultura según su ID
export const borrarCulturaPorId = async (id) => {
  // Elimina un registro de la tabla 'cultura' donde el ID coincida
  const [resultado] = await pool.query('DELETE FROM cultura WHERE cultura_id = ?', [id]);
  // Devuelve el resultado de la operación (número de filas afectadas, etc.)
  return resultado;
};