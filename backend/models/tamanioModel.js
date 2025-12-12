// Importa el pool de conexiones para ejecutar consultas a la base de datos
import { pool } from '../config/db.js';

// ------------------------------------------------------
// Obtener todos los tamaños registrados en la base de datos
// ------------------------------------------------------
export const obtenerTamanios = async () => {
  // Ejecuta una consulta para seleccionar todos los registros de la tabla 'tamanio'
  const [rows] = await pool.query('SELECT * FROM tamanio');
  // Devuelve los resultados como un arreglo de objetos
  return rows;
};

// ------------------------------------------------------
// Insertar un nuevo tamaño en la base de datos
// ------------------------------------------------------
export const insertarTamanio = async (tamanio) => {
  // Inserta un nuevo valor en la columna 'tamanio' de la tabla correspondiente
  await pool.query('INSERT INTO tamanio (tamanio) VALUES (?)', [tamanio]);
};

// ------------------------------------------------------
// Eliminar un tamaño existente por su ID
// ------------------------------------------------------
export const borrarTamanioPorId = async (id) => {
  // Ejecuta una eliminación del registro cuyo ID coincida
  const [resultado] = await pool.query('DELETE FROM tamanio WHERE tamanio_id = ?', [id]);
  // Devuelve el resultado de la operación (puede incluir cuántas filas fueron afectadas)
  return resultado;
};