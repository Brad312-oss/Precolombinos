// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';

// Función para obtener todas las piezas registradas en la base de datos
export const obtenerPiezas = async () => {
  // Ejecuta una consulta SQL que selecciona todos los registros de la tabla 'piezas'
  const [rows] = await pool.query('SELECT * FROM piezas');
  // Retorna los datos obtenidos (una lista de piezas)
  return rows;
};

// Función para insertar una nueva pieza
export const insertarPieza = async (nombre_pieza) => {
  // Inserta un nuevo registro en la tabla 'piezas' con el nombre de la pieza recibido
  await pool.query('INSERT INTO piezas (nombre_pieza) VALUES (?)', [nombre_pieza]);
};

// Función para eliminar una pieza por su ID
export const borrarPiezaPorId = async (id) => {
  // Ejecuta una consulta SQL que elimina la pieza cuyo ID coincida
  const [resultado] = await pool.query('DELETE FROM piezas WHERE piezas_id = ?', [id]);
  // Retorna el resultado de la eliminación (número de filas afectadas, etc.)
  return resultado;
};