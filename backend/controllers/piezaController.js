// Importamos las funciones del modelo piezaModel que interactúan con la base de datos
import {
  obtenerPiezas,
  insertarPieza,
  borrarPiezaPorId
} from '../models/piezaModel.js';

export const listarPiezas = async (req, res) => {
  try {
    // Obtenemos todas las piezas desde la base de datos
    const rows = await obtenerPiezas();

    // Enviamos los resultados en formato JSON
    res.json(rows);

  } catch (error) {
    // Si ocurre un error, lo registramos y enviamos un mensaje de error
    console.error('Error al obtener piezas:', error);
    res.status(500).json({ message: 'Error al obtener piezas' });
  }
};

export const crearPieza = async (req, res) => {
  const { nombre_pieza } = req.body; // Extraemos el nombre desde el cuerpo del request

  // Verificamos que el nombre esté presente
  if (!nombre_pieza) {
    return res.status(400).json({ message: 'El nombre de la pieza es obligatorio' });
  }

  try {
    // Insertamos la pieza en la base de datos
    await insertarPieza(nombre_pieza);

    // Respondemos con mensaje de éxito
    res.json({ message: 'Pieza creada correctamente' });
  } catch (error) {
    // Capturamos y mostramos el error si algo sale mal
    console.error('Error al crear pieza:', error);
    res.status(500).json({ message: 'Error al crear pieza' });
  }
};

export const eliminarPieza = async (req, res) => {
  const { id } = req.params; // Obtenemos el ID de la URL

  try {
    // Intentamos eliminar la pieza desde la base de datos
    const resultado = await borrarPiezaPorId(id);

    // Si no se afectó ninguna fila, significa que no existe la pieza
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Pieza no encontrada' });
    }

    // Si la eliminación fue exitosa, se envía un mensaje de confirmación
    res.json({ message: 'Pieza eliminada correctamente' });
  } catch (error) {
    // Verificamos si el error se debe a relaciones con productos
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'No se puede eliminar la pieza porque está asociada a productos' });
    }

    // Cualquier otro error se muestra por consola y se devuelve un error genérico
    console.error('Error al eliminar pieza:', error);
    res.status(500).json({ message: 'Error al eliminar pieza' });
  }
};