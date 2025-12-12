// Espera a que todo el contenido del DOM esté cargado y listo
document.addEventListener('DOMContentLoaded', () => {

  // Obtiene el objeto 'usuario' almacenado en localStorage (como texto)
  const usuarioRaw = localStorage.getItem('usuario');

  // Si no existe 'usuario' en localStorage, redirige al login (index.html)
  if (!usuarioRaw) {
    window.location.replace('/index.html');
    return; // Detiene la ejecución
  }

  // Parsea el texto JSON para convertirlo en objeto JavaScript
  const usuario = JSON.parse(usuarioRaw);

  // Si no hay usuario válido o el rol del usuario no es 3 (por ejemplo admin),
  // redirige al login porque no tiene permiso para esta página
  if (!usuario || Number(usuario.id_rol) !== 3) {
    window.location.replace('/index.html');
    return; // Detiene la ejecución
  }

  // Obtiene el nombre y apellido almacenados en localStorage
  const nombre = localStorage.getItem('nombre');
  const apellido = localStorage.getItem('apellido');

  // Busca el elemento HTML con id 'saludo' para mostrar un mensaje de bienvenida
  const saludo = document.getElementById('saludo');

  // Si existen nombre, apellido y el elemento saludo, actualiza el texto con el saludo personalizado
  if (nombre && apellido && saludo) {
    saludo.textContent = `Bienvenido, ${nombre} ${apellido}`;
  }

  // Añade un evento click al botón de cerrar sesión (logoutBtn)
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear(); // Limpia todo el localStorage (eliminando datos de usuario)
    window.location.replace('/index.html'); // Redirige al login
  });

});