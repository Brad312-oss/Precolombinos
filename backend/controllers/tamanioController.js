// Importamos las funciones del modelo de tamaños
import {
  obtenerTamanios,         // Función para obtener todos los tamaños
  insertarTamanio,         // Función para insertar un nuevo tamaño
  borrarTamanioPorId       // Función para eliminar un tamaño por su ID
} from '../models/tamanioModel.js';

// Controlador para listar todos los tamaños registrados en la base de datos
export const listarTamanios = async (req, res) => {
  try {
    // Obtenemos todos los tamaños usando la función del modelo
    const tamanios = await obtenerTamanios();

    // Enviamos la lista de tamaños como respuesta
    res.json(tamanios);
  } catch (error) {
    // Si ocurre un error, lo mostramos en consola y enviamos un mensaje de error
    console.error('Error al obtener tamaños:', error);
    res.status(500).json({ message: 'Error al obtener tamaños' });
  }
};

// Controlador para crear un nuevo tamaño
export const crearTamanio = async (req, res) => {
  const { tamanio } = req.body; // Extraemos el tamaño desde el cuerpo de la solicitud

  // Verificamos que el campo no venga vacío
  if (!tamanio) {
    return res.status(400).json({ message: 'El tamaño es obligatorio' });
  }

  try {
    // Insertamos el nuevo tamaño en la base de datos
    await insertarTamanio(tamanio);

    // Respondemos al cliente confirmando la operación
    res.json({ message: 'Tamaño agregado correctamente' });
  } catch (error) {
    // En caso de error, lo mostramos en consola y notificamos al cliente
    console.error('Error al crear tamaño:', error);
    res.status(500).json({ message: 'Error al crear tamaño' });
  }
};

// Controlador para eliminar un tamaño según su ID
export const eliminarTamanio = async (req, res) => {
  const { id } = req.params; // Obtenemos el ID del tamaño desde la URL

  try {
    // Intentamos borrar el tamaño con la función del modelo
    const resultado = await borrarTamanioPorId(id);

    // Si no se afectó ninguna fila, el tamaño no existe
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Tamaño no encontrado' });
    }

    // Respondemos confirmando que se eliminó correctamente
    res.json({ message: 'Tamaño eliminado correctamente' });
  } catch (error) {
    // Si el tamaño está relacionado con productos, no se puede eliminar
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'No se puede eliminar el tamaño porque está asociado a productos' });
    }

    // Otros errores se capturan y se reportan
    console.error('Error al eliminar tamaño:', error);
    res.status(500).json({ message: 'Error al eliminar tamaño' });
  }
};