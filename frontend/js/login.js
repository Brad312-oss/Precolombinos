// Escucha el evento submit del formulario de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que el formulario recargue la página

  // Obtiene los valores ingresados en los campos de correo y contraseña
  const correo = document.getElementById('correo').value;
  const contraseña = document.getElementById('contraseña').value;

  try {
    // Envía una petición POST al servidor con los datos de login
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contraseña }) // Envía correo y contraseña en JSON
    });

    const data = await res.json(); // Obtiene la respuesta del servidor

    if (res.ok) {
      // Si el login fue exitoso, guarda el token y usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Según el rol del usuario, redirige a la página correspondiente
      const rol = data.usuario.id_rol;
      switch (rol) {
        case 3:
          window.location.href = '/pages/admin_dashboard.html';
          break;
        case 2:
          window.location.href = '/pages/operario.html';
          break;
        case 1:
          window.location.href = '/pages/cliente_inicio.html';
          break;
        default:
          alert('Rol no reconocido'); // Rol que no está contemplado
      }
    } else {
      // Si el login falla, muestra un mensaje de error
      alert(data.message || 'Error en el login');
    }

  } catch (error) {
    // Captura errores de conexión o de otro tipo y los muestra en consola y alerta
    console.error('Error al iniciar sesión:', error);
    alert('Error de conexión');
  }
});

// Cuando el DOM está cargado, configura el enlace para recuperación de contraseña
document.addEventListener('DOMContentLoaded', () => {
  const enlace = document.getElementById('olvideContrasena'); // Obtiene el enlace

  if (enlace) {
    // Si el enlace existe, agrega un evento click para manejar la recuperación
    enlace.addEventListener('click', (event) => {
      event.preventDefault(); // Evita el comportamiento por defecto del enlace

      // Solicita al usuario que ingrese su correo para recuperación
      const correo = prompt('Ingresa tu correo para recuperar tu contraseña:');
      if (!correo) return; // Si no ingresa correo, no continúa

      // Envía petición para solicitar recuperación de contraseña
      fetch('http://localhost:3000/api/auth/solicitar-recuperacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }) // Envía el correo en formato JSON
      })
        .then(res => res.json())
        .then(data => {
          // Muestra un mensaje con el resultado de la solicitud
          alert(data.message || 'Revisa tu correo para instrucciones.');
        })
        .catch(err => {
          // En caso de error, lo muestra en consola y alerta al usuario
          console.error('Error:', err);
          alert('No se pudo enviar el correo.');
        });
    });
  } else {
    // Si no encuentra el enlace en el DOM, muestra una advertencia en consola
    console.warn('El enlace de recuperación no se encontró en el DOM');
  }
});