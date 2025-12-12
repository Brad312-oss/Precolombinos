// Importa JWT para manejar y verificar tokens de autenticación
import jwt from 'jsonwebtoken';
// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';

// Función para obtener el ID de un rol dado su nombre
export async function obtenerIdRolPorNombre(nombreRol) {
  // Realiza una consulta SQL para obtener el ID del rol según su nombre
  const [rows] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [nombreRol]);
  // Devuelve el ID si existe, o undefined si no se encuentra
  return rows[0]?.id;
}

// Middleware para verificar si un usuario está autenticado correctamente
export const verificarUsuario = async (req, res, next) => {
  // Extrae el token del header 'Authorization' (formato: 'Bearer <token>')
  const token = req.headers.authorization?.split(' ')[1];

  // Si no hay token, responde con error de autenticación
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verifica el token usando la clave secreta definida en las variables de entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Consulta el estado del usuario en la base de datos para validar que esté activo
    const [result] = await pool.query(
      'SELECT estado FROM usuarios WHERE usuario_id = ?',
      [decoded.usuario_id]
    );

    // Si el usuario no existe o no está activo, se rechaza la autenticación
    if (!result.length || result[0].estado !== 'activo') {
      return res.status(401).json({ message: 'Usuario inactivo o no encontrado' });
    }

    // Si todo está correcto, se agrega la info del usuario al objeto `req` para que esté disponible en los siguientes middleware/controladores
    req.usuario = {
      id: decoded.usuario_id,
      correo: decoded.correo,
      id_rol: decoded.id_rol
    };

    // Continúa con la ejecución del siguiente middleware o controlador
    next();
  } catch (error) {
    // Si el token no es válido o expiró, devuelve error de autenticación
    console.error('Error en verificarUsuario:', error);
    return res.status(401).json({ message: 'Token inválido o usuario no autenticado' });
  }
};

// Middleware para autorizar el acceso según roles específicos
export function autorizarRoles(rolesPermitidos) {
  // Devuelve una función middleware
  return (req, res, next) => {
    // Verifica que los rolesPermitidos sea un array válido
    if (!Array.isArray(rolesPermitidos)) {
      return res.status(500).json({ message: 'Error interno: rolesPermitidos debe ser un array' });
    }

    // Extrae el rol del usuario autenticado
    const rolUsuario = req.usuario.id_rol;

    // Verifica si el rol del usuario está dentro de los permitidos
    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permisos.' });
    }

    // Si el rol es válido, continúa con el siguiente middleware/controlador
    next();
  };
}
