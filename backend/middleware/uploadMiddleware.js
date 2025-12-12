// Importa 'multer', un middleware de Node.js para manejo de archivos subidos (multipart/form-data)
import multer from 'multer';
// Importa 'fs' para trabajar con el sistema de archivos (crear carpetas, etc.)
import fs from 'fs';

// Configuración del almacenamiento personalizado para multer
const storage = multer.diskStorage({
  // Define el directorio donde se guardarán los archivos subidos
  destination: function (req, file, cb) {
    const dir = 'uploads/productos'; // Carpeta destino

    // Crea la carpeta si no existe (de forma recursiva para crear subdirectorios también)
    fs.mkdirSync(dir, { recursive: true });

    // Devuelve el directorio donde se debe guardar el archivo
    cb(null, dir);
  },

  // Define cómo se debe nombrar el archivo subido
  filename: function (req, file, cb) {
    // Crea un nombre único basado en la fecha actual y el nombre original del archivo
    const uniqueName = Date.now() + '-' + file.originalname;

    // Devuelve el nombre final del archivo
    cb(null, uniqueName);
  }
});

// Exporta el middleware configurado para manejar la subida de archivos
export const upload = multer({ storage });