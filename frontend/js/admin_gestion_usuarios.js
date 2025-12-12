// Evento que se dispara cuando la página se muestra (incluyendo cuando se navega con atrás/adelante)
window.addEventListener('pageshow', function (event) {
  // Si la página está en cache (persisted) o es una navegación con back/forward, recarga la página
  if (event.persisted || (window.performance && performance.getEntriesByType("navigation")[0].type === "back_forward")) {
    location.reload();
  }
});

let usuarioActualId; // Variable para almacenar el ID del usuario actual

// Cuando el DOM esté cargado, se ejecuta esta función
document.addEventListener('DOMContentLoaded', () => {
  // Se obtiene el usuario guardado en localStorage
  const usuarioRaw = localStorage.getItem('usuario');

  // Si no hay usuario, redirige a la página de login
  if (!usuarioRaw) {
    location.href = '/index.html';
    return;
  }

  const usuario = JSON.parse(usuarioRaw);
  // Verifica que el usuario tenga el rol correcto (3 = administrador)
  if (usuario.id_rol !== 3) {
    location.href = '/index.html';
    return;
  }

  usuarioActualId = usuario.usuario_id; // Guarda el id del usuario actual

  listarUsuarios(); // Carga la lista de usuarios en la tabla

  // Evento para el botón de cerrar sesión
  document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
});

// Función para decodificar el JWT y obtener sus datos
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(
      atob(base64Url)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(base64);
  } catch (e) {
    return null; // Retorna null si el token no es válido
  }
}

// Función que retorna los headers necesarios para las peticiones con token
function getTokenHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Función asíncrona para listar los usuarios en la tabla
async function listarUsuarios() {
  try {
    // Petición GET a la API para obtener los usuarios
    const res = await fetch('http://localhost:3000/api/usuarios/listar', {
      method: 'GET',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener usuarios');

    const tbody = document.getElementById('tablaUsuarios');
    tbody.innerHTML = ''; // Limpia la tabla antes de llenar

    // Por cada usuario recibido, crea una fila en la tabla con sus datos y botones de acción
    data.forEach(usuario => {
      const tr = document.createElement('tr');

      // Celdas con información del usuario
      const tdId = document.createElement('td');
      tdId.textContent = usuario.usuario_id;
      tr.appendChild(tdId);

      const tdCedula = document.createElement('td');
      tdCedula.textContent = usuario.cedula || 'N/A';
      tr.appendChild(tdCedula);

      const tdNombre = document.createElement('td');
      tdNombre.textContent = `${usuario.nombre} ${usuario.apellido}`;
      tr.appendChild(tdNombre);

      const tdCorreo = document.createElement('td');
      tdCorreo.textContent = usuario.correo;
      tr.appendChild(tdCorreo);

      const tdRol = document.createElement('td');
      tdRol.textContent = usuario.nombre_rol;
      tr.appendChild(tdRol);

      const tdEstado = document.createElement('td');
      tdEstado.textContent = usuario.estado === 'activo' ? 'Activo' : 'Baneado';
      tr.appendChild(tdEstado);

      const acciones = document.createElement('td');

      // Botón para editar usuario
      const btnEditar = document.createElement('button');
      btnEditar.textContent = 'Editar';
      btnEditar.onclick = () => editarUsuario(usuario.usuario_id);
      acciones.appendChild(btnEditar);

      // Botón para eliminar usuario
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.onclick = () => eliminarUsuario(usuario.usuario_id);
      acciones.appendChild(btnEliminar);

      // Botón para banear o desbanear según estado del usuario
      if (usuario.estado === 'baneado') {
        const btnDesbanear = document.createElement('button');
        btnDesbanear.textContent = 'Desbanear';
        btnDesbanear.onclick = () => desbanearUsuario(usuario.usuario_id);
        acciones.appendChild(btnDesbanear);
      } else {
        const btnBanear = document.createElement('button');
        btnBanear.textContent = 'Banear';
        btnBanear.onclick = () => banearUsuario(usuario.usuario_id);
        acciones.appendChild(btnBanear);
      }

      // Botón para enviar correo al usuario
      const btnCorreo = document.createElement('button');
      btnCorreo.textContent = 'Correo';
      btnCorreo.onclick = () => enviarCorreo(usuario.correo);
      acciones.appendChild(btnCorreo);

      // Obtiene datos del token para controlar acciones sobre roles
      const token = parseJwt(localStorage.getItem('token'));
      
      if (usuario.id_rol === 3) {
        // Si el usuario es admin, puede quitar el rol a otros admins (menos a sí mismo)
        const btnQuitarAdmin = document.createElement('button');
        btnQuitarAdmin.textContent = 'Quitar Admin';
        
        if (token.id !== usuario.usuario_id) {
          btnQuitarAdmin.onclick = () => quitarRolAdmin(usuario.usuario_id);
        } else {
          // No puede quitarse su propio rol de admin
          btnQuitarAdmin.disabled = true;
          btnQuitarAdmin.title = "No puedes quitarte tu propio rol";
        }
        
        acciones.appendChild(btnQuitarAdmin);
      
      } else {
        // Si no es admin, puede ser promovido a admin
        const btnHacerAdmin = document.createElement('button');
        btnHacerAdmin.textContent = 'Hacer Admin';
        btnHacerAdmin.onclick = () => cambiarRolAdmin(usuario.usuario_id);
        acciones.appendChild(btnHacerAdmin);
      }

      tr.appendChild(acciones);
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar los usuarios');
  }
}

// Función para banear un usuario, evita que el usuario se banee a sí mismo
async function banearUsuario(id) {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  if (usuarioActual.usuario_id === id) {
    return alert('No puedes banearte a ti mismo');
  }

  if (!confirm('¿Estás seguro de banear este usuario?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/${id}/banear`, {
      method: 'PUT',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al banear');

    alert('Usuario baneado correctamente');
    listarUsuarios();
  } catch (err) {
    console.error(err);
    alert('No se pudo banear al usuario');
  }
}

// Función para enviar correo al usuario con asunto y mensaje que el admin ingresa por prompt
function enviarCorreo(correo) {
  const asunto = prompt('Asunto del correo:');
  const mensaje = prompt('Mensaje para enviar:');
  if (!asunto || !mensaje) return;

  fetch('http://localhost:3000/api/usuarios/enviar-correo', {
    method: 'POST',
    headers: getTokenHeaders(),
    body: JSON.stringify({ correo, asunto, mensaje })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Correo enviado');
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo enviar el correo');
    });
}

// Función para cerrar sesión, eliminando token y usuario del localStorage y redirigiendo al login
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  location.href = '/index.html';
}

// Función para editar los datos de un usuario, solicitando nuevos datos con prompt
async function editarUsuario(id) {
  const nombre = prompt('Nuevo nombre:');
  const apellido = prompt('Nuevo apellido:');
  const correo = prompt('Nuevo correo:');
  const telefono = prompt('Teléfono:');
  const direccion = prompt('Dirección:');

  if (!nombre || !apellido || !correo) return alert('Campos obligatorios incompletos');

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/editar', {
      method: 'PUT',
      headers: getTokenHeaders(),
      body: JSON.stringify({
        usuario_id: id,
        nombre,
        apellido,
        correo,
        telefono,
        direccion
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert('Usuario actualizado');
    listarUsuarios();
  } catch (err) {
    console.error(err);
    alert('Error al editar usuario');
  }
}

// Función para eliminar un usuario, evitando que el usuario se elimine a sí mismo
async function eliminarUsuario(id) {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  if (usuarioActual.usuario_id === id) {
    return alert('No puedes eliminarte a ti mismo');
  }

  if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/eliminar/${id}`, {
      method: 'DELETE',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert('Usuario eliminado correctamente');
    listarUsuarios();
  } catch (err) {
    console.error(err);
    alert('No se pudo eliminar el usuario');
  }
}

// Función para desbanear un usuario
async function desbanearUsuario(usuario_id) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/desbanear`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ usuario_id })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Usuario desbaneado');
      listarUsuarios();
    } else {
      alert(data.message || 'Error al desbanear');
    }
  } catch (error) {
    console.error('Error al desbanear:', error);
  }
}

// Función para cambiar el rol de un usuario a administrador
async function cambiarRolAdmin(id) {
  if (!confirm('¿Deseas convertir este usuario en administrador?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/cambiar-rol`, {
      method: 'PUT',
      headers: getTokenHeaders(),
      body: JSON.stringify({
        usuario_id: id,
        nuevo_rol: 3
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert('Rol actualizado a Administrador');
    listarUsuarios();

    // Actualiza localStorage si el rol modificado es del usuario actual
    if (id === usuarioActualId) {
      const actualizado = JSON.parse(localStorage.getItem('usuario'));
      actualizado.id_rol = 3;
      localStorage.setItem('usuario', JSON.stringify(actualizado));
    }

  } catch (err) {
    console.error(err);
    alert('No se pudo cambiar el rol del usuario');
  }
}

// Función para quitar el rol de administrador a un usuario (pasándolo a cliente)
async function quitarRolAdmin(id) {
  if (id === usuarioActualId) {
    alert('No puedes quitarte tu propio rol de administrador.');
    return;
  }

  if (!confirm('¿Deseas quitar el rol de administrador a este usuario?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/cambiar-rol`, {
      method: 'PUT',
      headers: getTokenHeaders(),
      body: JSON.stringify({
        usuario_id: id,
        nuevo_rol: 1
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert('Rol de administrador eliminado. Ahora es cliente.');
    listarUsuarios();

    if (id === usuarioActualId) {
      const actualizado = JSON.parse(localStorage.getItem('usuario'));
      actualizado.id_rol = 1;
      localStorage.setItem('usuario', JSON.stringify(actualizado));
    }

  } catch (err) {
    console.error(err);
    alert('No se pudo cambiar el rol del usuario');
  }
}