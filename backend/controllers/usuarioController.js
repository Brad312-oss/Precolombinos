import { pool } from '../config/db.js'; // Importamos la conexión a la base de datos

// Obtener la lista completa de usuarios con sus roles
export const listarUsuarios = async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT u.usuario_id, u.cedula, u.nombre, u.apellido, u.correo, u.estado, u.id_rol, r.nombre AS nombre_rol
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.rol_id
    `);

    res.json(usuarios); // Respondemos con los datos de los usuarios
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Cambiar el rol de un usuario (con verificación para que un admin no se desadministre a sí mismo)
export const cambiarRolUsuario = async (req, res) => {
  const { usuario_id, nuevo_rol } = req.body;
  const admin_id = req.usuario?.id;

  // Validamos campos obligatorios
  if (!usuario_id || !nuevo_rol) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  // Evitar que un administrador se cambie a sí mismo a otro rol
  if (parseInt(usuario_id) === parseInt(admin_id) && parseInt(nuevo_rol) !== 3) {
    return res.status(403).json({ message: 'No puedes quitarte tu propio rol de administrador' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET id_rol = ? WHERE usuario_id = ?',
      [nuevo_rol, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Editar datos de un usuario
export const editarUsuario = async (req, res) => {
  const { usuario_id, nombre, apellido, correo, telefono, direccion } = req.body;

  // Validamos que no falten datos esenciales
  if (!usuario_id || !nombre || !apellido || !correo) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, telefono = ?, direccion = ? WHERE usuario_id = ?',
      [nombre, apellido, correo, telefono, direccion, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Banear (desactivar) a un usuario
export const banearUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET estado = "baneado" WHERE usuario_id = ?',
      [usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario baneado correctamente' });
  } catch (error) {
    console.error('Error al banear usuario:', error);
    res.status(500).json({ message: 'Error al banear usuario' });
  }
};

// Eliminar físicamente un usuario de la base de datos
export const eliminarUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE usuario_id = ?', [usuario_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Envío de correos a usuarios
import { enviarCorreoGenerico } from '../config/email.js';

export const enviarCorreoUsuario = async (req, res) => {
  const { correo, asunto, mensaje } = req.body;

  // Validamos que no falte ningún campo
  if (!correo || !asunto || !mensaje) {
    return res.status(400).json({ message: 'Faltan campos del correo' });
  }

  try {
    await enviarCorreoGenerico(correo, asunto, `<p>${mensaje}</p>`);
    res.json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
};

// Desbanear a un usuario (cambiar estado a 'activo')
export const desbanearUsuario = async (req, res) => {
  const { usuario_id } = req.body;

  try {
    const [resultado] = await pool.query(
      'UPDATE usuarios SET estado = ? WHERE usuario_id = ?',
      ['activo', usuario_id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario desbaneado exitosamente' });
  } catch (error) {
    console.error('Error al desbanear usuario:', error);
    res.status(500).json({ message: 'Error al desbanear usuario' });
  }
};

// Obtener clientes activos (usuarios con rol 1)
export const obtenerClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query(`
      SELECT usuario_id, nombre, apellido, correo 
      FROM usuarios 
      WHERE id_rol = ? AND estado = "activo"
    `, [1]);

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

// Obtener estadísticas de usuarios en un rango de fechas
export const obtenerEstadisticasUsuarios = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  try {
    // Cantidad total de nuevos usuarios
    const [[{ total_nuevos }]] = await pool.query(
      `SELECT COUNT(*) AS total_nuevos
       FROM usuarios
       WHERE fecha_registro BETWEEN ? AND ?`,
      [fechaInicio, fechaFin]
    );

    // Conteo por rol
    const [porRol] = await pool.query(
      `SELECT r.nombre AS rol, COUNT(*) AS cantidad
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.rol_id
       WHERE u.fecha_registro BETWEEN ? AND ?
       GROUP BY u.id_rol`,
      [fechaInicio, fechaFin]
    );

    // Detalle completo de usuarios registrados en ese periodo
    const [detalle] = await pool.query(
      `SELECT u.usuario_id, u.nombre, u.apellido, u.correo,
              r.nombre AS rol, u.estado, u.fecha_registro, u.last_login
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.rol_id
       WHERE u.fecha_registro BETWEEN ? AND ?
       ORDER BY u.fecha_registro DESC`,
      [fechaInicio, fechaFin]
    );

    // Cantidad de usuarios baneados en ese periodo
    const [[{ total_baneados }]] = await pool.query(
      `SELECT COUNT(*) AS total_baneados
       FROM usuarios
       WHERE estado = 'baneado'
       AND fecha_registro BETWEEN ? AND ?`,
      [fechaInicio, fechaFin]
    );

    // Enviamos el resumen y detalle al cliente
    res.json({
      resumen: { total_nuevos, total_baneados, porRol },
      detalle
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({ message: 'Error al generar estadísticas' });
  }
};

// Permitir que el cliente actualice su perfil (autenticado)
export const actualizarPerfilCliente = async (req, res) => {
  const { nombre, apellido, correo, telefono, direccion } = req.body;
  const usuario_id = req.usuario.id;

  console.log('Valores recibidos:', { nombre, apellido, correo, telefono, direccion, usuario_id });

  try {
    await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, telefono = ?, direccion = ? WHERE usuario_id = ?',
      [nombre, apellido, correo, telefono, direccion, usuario_id]
    );

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};