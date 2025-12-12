// Importamos el pool de conexiones para realizar consultas a la base de datos
import { pool } from '../config/db.js';

// Controlador para listar todas las reseñas de los productos
export const listarResenas = async (req, res) => {
  try {
    // Ejecutamos una consulta SQL para obtener los comentarios de los usuarios,
    // el nombre del usuario y una descripción del producto relacionada (pieza - cultura - tamaño)
    const [rows] = await pool.query(`
      SELECT r.comentario, u.nombre, 
        CONCAT(pz.nombre_pieza, ' - ', c.cultura, ' - ', t.tamanio) AS nombre_producto
      FROM resenas r
      JOIN usuarios u ON u.usuario_id = r.usuario_id               -- Relacionamos la reseña con el usuario
      JOIN productos pr ON pr.producto_id = r.producto_id          -- Relacionamos la reseña con el producto
      JOIN piezas pz ON pz.piezas_id = pr.piezas_id                -- Obtenemos la pieza del producto
      JOIN cultura c ON c.cultura_id = pr.cultura_id               -- Obtenemos la cultura del producto
      JOIN tamanio t ON t.tamanio_id = pr.tamanio_id               -- Obtenemos el tamaño del producto
      ORDER BY r.fecha DESC                                        -- Ordenamos las reseñas de más reciente a más antigua
    `);

    // Enviamos las reseñas obtenidas como respuesta
    res.json(rows);
  } catch (error) {
    // Mostramos el error en consola y devolvemos un mensaje genérico al cliente
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
};

// Controlador para crear una nueva reseña de un producto
export const crearResena = async (req, res) => {
  // Extraemos el ID del producto y el comentario desde el cuerpo del request
  const { producto_id, comentario } = req.body;

  // Obtenemos el ID del usuario autenticado desde el token (middleware de autenticación)
  const usuario_id = req.usuario.id;

  try {
    // Insertamos una nueva reseña en la base de datos con la fecha actual (NOW())
    await pool.query(
      'INSERT INTO resenas (producto_id, usuario_id, comentario, fecha) VALUES (?, ?, ?, NOW())',
      [producto_id, usuario_id, comentario]
    );

    // Respondemos al cliente indicando que la reseña fue guardada correctamente
    res.json({ message: 'Reseña enviada correctamente' });
  } catch (error) {
    // Mostramos el error en consola y respondemos con error al cliente
    console.error('Error al crear reseña:', error);
    res.status(500).json({ message: 'Error al crear reseña' });
  }
};