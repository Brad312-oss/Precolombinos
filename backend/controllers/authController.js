// Importamos funciones para enviar correos de confirmación y recuperación
import { enviarCorreoRecuperacion, enviarCorreoConfirmacion } from '../config/email.js';
// Librería para encriptar contraseñas
import bcrypt from 'bcrypt';
// Módulo para generar tokens aleatorios (útil en recuperación de contraseña)
import crypto from 'crypto';
// Librería para generar y verificar tokens JWT (autenticación)
import jwt from 'jsonwebtoken';
// Pool de conexiones para acceder a la base de datos MySQL
import { pool } from '../config/db.js';
// Funciones del modelo de usuario
import {
  buscarUsuarioPorCorreo,
  crearUsuario,
} from '../models/userModel.js';

export const register = async (req, res) => {
  // Extraemos los datos del cuerpo de la solicitud
  const { nombre, apellido, correo, cedula, telefono, direccion, fecha_registro, contraseña } = req.body;

  // Validamos que todos los campos estén presentes
  if (!nombre || !apellido || !correo || !cedula || !telefono || !direccion || !fecha_registro || !contraseña) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Verificamos si el correo ya está registrado
  const userExistente = await buscarUsuarioPorCorreo(correo);
  if (userExistente) {
    return res.status(400).json({ message: 'Usuario ya registrado' });
  }

  // Encriptamos la contraseña antes de guardarla
  const hash = await bcrypt.hash(contraseña, 10);
  const id_rol = 1;

  // Creamos el nuevo usuario en la base de datos
  await crearUsuario(nombre, apellido, correo, cedula, telefono, direccion, fecha_registro, hash, id_rol);
  // Enviamos un correo de confirmación
  await enviarCorreoConfirmacion(correo, nombre);

  // Respondemos con éxito
  res.status(201).json({ message: 'Usuario creado exitosamente' });
};

export const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  // Validamos que se ingresen correo y contraseña
  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  // Buscamos al usuario en la base de datos
  const usuario = await buscarUsuarioPorCorreo(correo);
  // Verificamos que el usuario exista y la contraseña coincida
  const credencialesValidas = usuario && await bcrypt.compare(contraseña, usuario.contraseña);

  if (!credencialesValidas) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
  }

  // Si el usuario está baneado, se le niega el acceso
  if (usuario.estado === 'baneado') {
    return res.status(403).json({ message: 'Usuario baneado. Acceso denegado.' });
  }

  // Generamos un token JWT para la sesión
  const token = jwt.sign(
    { usuario_id: usuario.usuario_id, correo: usuario.correo, id_rol: usuario.id_rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Actualizamos la fecha del último inicio de sesión
  await pool.query(
    'UPDATE usuarios SET last_login = NOW() WHERE usuario_id = ?',
    [usuario.usuario_id]
  );

  // Respondemos con el token y datos del usuario
  res.status(200).json({
    message: 'Inicio de sesión exitoso',
    token,
    usuario: {
      usuario_id: usuario.usuario_id,
      id_rol: usuario.id_rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo
    }
  });
};

export const solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;

  try {
    // Verificamos que el correo exista
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Correo no encontrado' });
    }

    // Generamos un token de recuperación
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Guardamos el token y su expiración en la base de datos
    await pool.query(
      'UPDATE usuarios SET reset_token = ?, reset_token_expira = ? WHERE correo = ?',
      [token, expira, correo]
    );

    // Generamos el enlace con el token
    const resetLink = `http://localhost:3000/pages/reset.html?token=${token}&correo=${correo}`;

    // Enviamos el correo de recuperación
    await enviarCorreoRecuperacion(correo, rows[0].nombre, resetLink);

    res.json({ message: 'Correo de recuperación enviado' });

  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const cambiarContrasena = async (req, res) => {
  const { correo, token, nuevaContrasena } = req.body;

  try {
    // Verificamos que el token sea válido y no haya expirado
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ? AND reset_token = ? AND reset_token_expira > NOW()',
      [correo, token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Encriptamos la nueva contraseña
    const hash = await bcrypt.hash(nuevaContrasena, 10);
    // Actualizamos la contraseña y eliminamos el token
    await pool.query(
      'UPDATE usuarios SET contraseña = ?, reset_token = NULL, reset_token_expira = NULL WHERE correo = ?',
      [hash, correo]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};