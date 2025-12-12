// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', async () => {
  // Obtiene el token de autenticación almacenado en localStorage
  const token = localStorage.getItem('token');
  console.log('Token:', token);

  // Si no existe token, redirige al usuario a la página de login
  if (!token) {
    console.log('No hay token, redirigiendo a login');
    return window.location.href = '../pages/login.html';
  }

  try {
    console.log('Enviando verificación...');
    // Envía una solicitud al servidor para verificar la validez del token
    const res = await fetch('/api/auth/verificar', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Obtiene la respuesta del servidor en formato JSON
    const data = await res.json();
    console.log('Respuesta verificación:', JSON.stringify(data, null, 2));

    // Si la respuesta no es exitosa o el usuario no tiene rol 1, lo redirige al login
    if (!res.ok || Number(data.usuario.id_rol) !== 1) {
      console.log('Rol inválido, redirigiendo');
      return window.location.href = '../pages/login.html';
    }

  } catch (err) {
    // Si ocurre un error en la verificación, lo muestra en consola y redirige al login
    console.error('Error en la verificación:', err);
    return window.location.href = '../pages/login.html';
  }

  // Configura el botón para ver el catálogo, que redirige a la página correspondiente
  document.getElementById('verCatalogoBtn').addEventListener('click', () => {
    window.location.href = './cliente_catalogo.html';
  });

  // Configura el botón para editar el perfil, que redirige a la página de edición
  document.getElementById('editarPerfilBtn').addEventListener('click', () => {
    window.location.href = './cliente_editar.html';
  });

  // Configura el botón de logout que elimina el token y redirige al login
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token'); // Borra el token de localStorage
    window.location.href = '../pages/login.html'; // Redirige al login
  });
});