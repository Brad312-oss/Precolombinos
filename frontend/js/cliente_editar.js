// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
  // Obtiene el token de autenticación guardado en localStorage
  const token = localStorage.getItem('token');
  // Si no hay token, redirige al usuario a la página de login
  if (!token) return window.location.href = '../pages/login.html';

  try {
    // Verifica el token enviándolo al backend para validar sesión y rol
    const res = await fetch('/api/auth/verificar', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Obtiene la respuesta JSON con los datos del usuario
    const data = await res.json();
    // Si la respuesta no es correcta o el rol no es el esperado (1),
    // redirige al login (no tiene permiso)
    if (!res.ok || Number(data.usuario.id_rol) !== 1) {
      return window.location.href = '../pages/login.html';
    }

    // Si la verificación fue exitosa, llena los campos del formulario
    // con los datos del usuario recibidos
    document.getElementById('nombre').value = data.usuario.nombre || '';
    document.getElementById('apellido').value = data.usuario.apellido || '';
    document.getElementById('correo').value = data.usuario.correo || '';
    document.getElementById('telefono').value = data.usuario.telefono || '';
    document.getElementById('direccion').value = data.usuario.direccion || '';
  } catch (err) {
    // Si hubo algún error durante la verificación, lo muestra en consola
    // y redirige al login para intentar iniciar sesión de nuevo
    console.error('Error de verificación:', err);
    return window.location.href = '../pages/login.html';
  }

  // Evento para el formulario de editar perfil cuando se envía
  document.getElementById('formEditarPerfil').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página

    // Obtiene los valores actualizados desde los campos del formulario
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;

    try {
      // Envía los datos actualizados al servidor para modificar el perfil
      const res = await fetch('/api/usuarios/actualizar-perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Convierte los datos a formato JSON para enviarlos
        body: JSON.stringify({ nombre, apellido, correo, telefono, direccion })
      });

      // Obtiene la respuesta del servidor
      const result = await res.json();
      // Muestra un mensaje con el resultado de la actualización
      alert(result.message || 'Perfil actualizado');
    } catch (err) {
      // En caso de error, lo muestra en consola y alerta al usuario
      console.error('Error al actualizar:', err);
      alert('Hubo un error al actualizar el perfil');
    }
  });

  // Evento para el botón cancelar que redirige a la página principal del cliente
  document.getElementById('cancelarBtn').addEventListener('click', () => {
    window.location.href = './cliente_inicio.html';
  });
});