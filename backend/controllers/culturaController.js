// Importamos las funciones del modelo culturaModel que interactúan con la base de datos
import {
  obtenerCulturas,
  insertarCultura,
  borrarCulturaPorId
} from '../models/culturaModel.js';

export const listarCulturas = async (req, res) => {
  try {
    // Obtenemos la lista de culturas desde la base de datos
    const culturas = await obtenerCulturas();
    // Enviamos la lista como respuesta en formato JSON
    res.json(culturas);
  } catch (error) {
    // Si ocurre un error, lo mostramos en consola y devolvemos un error al cliente
    console.error('Error al obtener culturas:', error);
    res.status(500).json({ message: 'Error al obtener culturas' });
  }
};

export const crearCultura = async (req, res) => {
  const { cultura } = req.body; // Extraemos el nombre de la cultura del cuerpo de la solicitud

  // Validamos que el campo no esté vacío
  if (!cultura) {
    return res.status(400).json({ message: 'El nombre de la cultura es obligatorio' });
  }

  try {
    // Insertamos la cultura en la base de datos
    await insertarCultura(cultura);
    // Respondemos con un mensaje de éxito
    res.json({ message: 'Cultura agregada correctamente' });
  } catch (error) {
    // Si ocurre un error al insertar, lo mostramos en consola y devolvemos un error al cliente
    console.error('Error al agregar cultura:', error);
    res.status(500).json({ message: 'Error al agregar cultura' });
  }
};

export const eliminarCultura = async (req, res) => {
  const { id } = req.params;// Obtenemos el ID de la cultura desde la URL

  try {
    // Intentamos eliminar la cultura desde la base de datos
    const resultado = await borrarCulturaPorId(id);

    // Si no se eliminó ninguna fila, significa que no existe la cultura
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Cultura no encontrada' });
    }

    // Si todo sale bien, confirmamos la eliminación
    res.json({ message: 'Cultura eliminada correctamente' });
  } catch (error) {
    // Si hay un error de integridad referencial (cultura ligada a productos), enviamos un mensaje específico
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'No se puede eliminar la cultura porque está asociada a productos' });
    }

    // Otro tipo de error
    console.error('Error al eliminar cultura:', error);
    res.status(500).json({ message: 'Error al eliminar cultura' });
  }
};