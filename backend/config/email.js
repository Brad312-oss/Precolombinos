// Importamos el módulo 'nodemailer', que permite enviar correos electrónicos desde Node.js.
import nodemailer from 'nodemailer';

// Importamos 'dotenv', una librería que permite cargar variables de entorno desde un archivo .env
import dotenv from 'dotenv';
dotenv.config();

// Creamos un "transporter", que es el objeto responsable de enviar correos.
// Aquí estamos usando el servicio de Gmail y autenticándonos con las credenciales guardadas en variables de entorno.
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Esta función permite enviar un correo genérico.
// Recibe como parámetros: destinatario (to), asunto (subject) y el contenido en formato HTML (html).
export const enviarCorreoGenerico = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

// Esta función envía un correo específico de confirmación de registro.
// Se usa cuando un usuario se registra exitosamente en la plataforma.
export const enviarCorreoConfirmacion = async (destinatario, nombre) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Confirmación de registro - Precolombinos',
    html: `<h3>Hola ${nombre},</h3><p>Gracias por registrarte en Precolombinos. Tu cuenta ha sido creada con éxito.</p>`
  };

  await transporter.sendMail(mailOptions);
};

// Esta función se utiliza para enviar un correo de recuperación de contraseña.
// Incluye un enlace personalizado que permite al usuario restablecer su clave.
export const enviarCorreoRecuperacion = async (destinatario, nombre, enlace) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Recuperación de contraseña - Precolombinos',
    html: `<p>Hola ${nombre},</p>
           <p>Recibimos una solicitud para restablecer tu contraseña.</p>
           <p>Puedes restablecerla haciendo clic en el siguiente enlace:</p>
           <a href="${enlace}">${enlace}</a>
           <p>Este enlace expirará en 15 minutos.</p>`
  };

  await transporter.sendMail(mailOptions);
};