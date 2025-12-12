// Obtiene el botón de cerrar sesión por su id
const logoutBtn = document.getElementById('logoutBtn');

// Verifica si el botón existe en el DOM para evitar errores
if (logoutBtn) {
  // Agrega un evento click al botón de cerrar sesión
  logoutBtn.addEventListener('click', () => {
    localStorage.clear(); // Limpia todos los datos almacenados en localStorage (token, usuario, etc.)
    window.location.replace('/index.html'); // Redirige al usuario a la página principal (inicio)
  });
}