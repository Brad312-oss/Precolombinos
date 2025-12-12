// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', async () => {
  // Obtiene el token guardado en localStorage para autenticar al usuario
  const token = localStorage.getItem('token');
  // Si no hay token, redirige al usuario a la página de login
  if (!token) return window.location.href = '../pages/login.html';

  // Función para cargar productos desde la API y mostrarlos en el select
  const cargarProductos = async () => {
    const res = await fetch('/api/productos'); // Solicita la lista de productos
    const productos = await res.json(); // Convierte la respuesta a JSON
    const select = document.getElementById('producto'); // Obtiene el select del DOM

    // Recorre los productos y crea una opción para cada uno en el select
    productos.forEach(p => {
      // Construye el nombre que se mostrará en el select
      const nombre = `${p.nombre_pieza} - ${p.cultura} - ${p.tamanio}`;
      const option = document.createElement('option'); // Crea elemento option
      option.value = p.producto_id; // Valor del option es el id del producto
      option.textContent = nombre; // Texto que verá el usuario
      select.appendChild(option); // Agrega la opción al select
    });
  };

  // Función para cargar las reseñas desde la API y mostrarlas en la página
  const cargarResenas = async () => {
    const res = await fetch('/api/resenas'); // Solicita la lista de reseñas
    const resenas = await res.json(); // Convierte la respuesta a JSON
    const contenedor = document.getElementById('listaResenas'); // Contenedor donde se mostrarán

    contenedor.innerHTML = ''; // Limpia el contenedor para actualizar el contenido

    // Recorre cada reseña y crea un div para mostrarla con formato
    resenas.forEach(r => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${r.nombre}</strong> comentó sobre <em>${r.nombre_producto}</em>:<br>${r.comentario}<hr>`;
      contenedor.appendChild(div); // Agrega el div al contenedor
    });
  };

  // Evento al enviar el formulario de reseñas
  document.getElementById('formResena').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página

    // Obtiene los valores seleccionados o escritos en el formulario
    const producto_id = document.getElementById('producto').value;
    const comentario = document.getElementById('comentario').value;

    // Envía la reseña al servidor mediante una petición POST
    const res = await fetch('/api/resenas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Autentica la petición con el token
      },
      body: JSON.stringify({ producto_id, comentario }) // Envía el id y comentario en formato JSON
    });

    const data = await res.json(); // Respuesta del servidor
    alert(data.message || 'Reseña enviada'); // Muestra mensaje al usuario

    document.getElementById('formResena').reset(); // Limpia el formulario
    cargarResenas(); // Recarga las reseñas para mostrar la nueva
  });

  // Llama las funciones para cargar productos y reseñas al cargar la página
  await cargarProductos();
  await cargarResenas();
});