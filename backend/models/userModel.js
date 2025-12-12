// Importa el pool de conexiones para acceder a la base de datos
import { pool } from '../config/db.js';

// --------------------------------------------------------------
// Función para crear un nuevo usuario en la base de datos
// --------------------------------------------------------------
export const crearUsuario = async (
  nombre, apellido, correo, cedula, telefono, direccion,
  fecha_registro, contraseña, id_rol
) => {
  // Inserta un nuevo usuario en la tabla 'usuarios' con todos sus datos
  const [result] = await pool.query(
    'INSERT INTO usuarios(nombre, apellido, correo, cedula, telefono, direccion, fecha_registro, contraseña, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nombre, apellido, correo, cedula, telefono, direccion, fecha_registro, contraseña, id_rol]
  );
  // Devuelve el ID del nuevo usuario insertado
  return result.insertId;
};

// --------------------------------------------------------------
// Función para buscar un usuario por su correo electrónico
// --------------------------------------------------------------
export const buscarUsuarioPorCorreo = async (correo) => {
  // Ejecuta una consulta SQL para buscar un usuario que coincida con el correo
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE correo = ?', [correo]
  );
  // Devuelve el primer usuario encontrado o undefined si no existe
  return rows[0];
};

// --------------------------------------------------------------
// Función para obtener el nombre de un rol dado su ID
// --------------------------------------------------------------
export const obtenerRolPorId = async (id_rol) => {
  // Busca el nombre del rol en la tabla 'roles' usando su identificador
  const [rows] = await pool.query(
    'SELECT nombre FROM roles WHERE rol_id = ?', [id_rol]
  );
  // Devuelve solo el nombre del rol (o undefined si no se encuentra)
  return rows[0]?.nombre;
};
