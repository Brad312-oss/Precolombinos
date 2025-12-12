document.addEventListener('DOMContentLoaded', () => {
  // Función para obtener el token de autenticación desde el localStorage
  function getTokenHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`  // Agrega el token en el header Authorization
    };
  }

  // Obtener token y usuario almacenados localmente
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Validar que el usuario esté autorizado: debe existir, ser rol 3 y tener token
  if (!usuario || Number(usuario.id_rol) !== 3 || !token) {
    alert('Acceso no autorizado. Vuelve a iniciar sesión.');
    localStorage.clear(); // Limpiar almacenamiento local
    window.location.href = '../index.html'; // Redirigir a la página de login
    return; // Detener la ejecución
  }

  // Verificar que el token sea válido haciendo una petición a la API
  fetch('http://localhost:3000/api/auth/verificar', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Token inválido');
      return res.json();
    })
    .catch(err => {
      console.error('Token inválido o expirado:', err);
      alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      localStorage.clear();
      window.location.href = '../index.html';
    });

  // Obtener referencias a elementos del DOM
  const piezasSelect = document.getElementById('piezas_id');
  const culturaSelect = document.getElementById('cultura_id');
  const tamanioSelect = document.getElementById('tamanio_id');
  const form = document.getElementById('formProducto');
  const tabla = document.getElementById('tablaProductos');
  const imagenInput = document.getElementById('imagen');
  let editandoId = null; // Variable para controlar si se está editando un producto

  // Función para cargar opciones en un <select> desde una URL
  const cargarSelect = async (url, select) => {
    const res = await fetch(url, { headers: getTokenHeaders() });
    const datos = await res.json();
    select.innerHTML = ''; // Limpiar opciones actuales
    datos.forEach(item => {
      const option = document.createElement('option');
      // Se asume que los objetos tienen propiedades id y nombre (o similares)
      option.value = item.id || item[Object.keys(item)[0]];
      option.textContent = item.nombre || item[Object.keys(item)[1]];
      select.appendChild(option);
    });
  };

  // Función para listar todos los productos en la tabla
  const listarProductos = async () => {
    const res = await fetch('/api/productos', { headers: getTokenHeaders() });
    const productos = await res.json();
    tabla.innerHTML = ''; // Limpiar tabla
    productos.forEach(p => {
      // Crear fila con los datos del producto y botones para editar/eliminar
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${p.producto_id}</td>
        <td>${p.nombre_pieza}</td>
        <td>${p.cultura}</td>
        <td>${p.tamanio}</td>
        <td>${p.precio}</td>
        <td>${p.stock}</td>
        <td>
          <button class="editar" data-id="${p.producto_id}">✏️</button>
          <button class="eliminar" data-id="${p.producto_id}">🗑️</button>
        </td>
      `;
      tabla.appendChild(fila);
    });
  };

  // Evento submit del formulario para crear o editar un producto
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que se recargue la página

    // Crear FormData para enviar datos y archivos
    const formData = new FormData();
    formData.append('piezas_id', piezasSelect.value);
    formData.append('cultura_id', culturaSelect.value);
    formData.append('tamanio_id', tamanioSelect.value);
    formData.append('precio', document.getElementById('precio').value);
    formData.append('stock', document.getElementById('stock').value);
    formData.append('descripcion', document.getElementById('descripcion').value);

    const archivoImagen = imagenInput.files[0];

    // Si no hay imagen al crear, mostrar alerta
    if (!archivoImagen && !editandoId) {
      alert('Debes subir una imagen');
      return;
    }

    // Si hay imagen, agregarla al formData
    if (archivoImagen) {
      formData.append('imagen', archivoImagen);
    }

    // Definir la URL y método según si se edita o crea
    const url = editandoId ? `/api/productos/${editandoId}` : '/api/productos';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      // Realizar petición para guardar producto
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      alert(result.message || 'Guardado correctamente');
      form.reset();
      imagenInput.value = '';
      editandoId = null; // Resetear estado de edición
      listarProductos(); // Actualizar la lista de productos
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar producto');
    }
  });

  // Evento para gestionar clicks en la tabla de productos (editar o eliminar)
  tabla.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('eliminar')) {
      // Confirmar eliminación y eliminar producto
      if (!confirm('¿Eliminar producto?')) return;
      const res = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: getTokenHeaders()
      });
      const result = await res.json();
      alert(result.message);
      listarProductos(); // Actualizar lista
    }

    if (e.target.classList.contains('editar')) {
      // Cargar producto para editar y llenar el formulario
      const res = await fetch('/api/productos', {
        headers: getTokenHeaders()
      });
      const productos = await res.json();
      const producto = productos.find(p => p.producto_id == id);

      if (producto) {
        piezasSelect.value = producto.piezas_id;
        culturaSelect.value = producto.cultura_id;
        tamanioSelect.value = producto.tamanio_id;
        document.getElementById('imagen').value = ''; // Limpiar input imagen
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock;
        editandoId = id; // Guardar id para saber que se está editando
        // Scroll al formulario para facilitar edición
        window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
      }
    }
  });

  // Eventos y funciones para manejar piezas, tamaños y culturas siguen la misma lógica:

  // Agregar nueva pieza
  document.getElementById('formPieza').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre_pieza = document.getElementById('nuevaPieza').value.trim();
    if (!nombre_pieza) return alert('Ingresa un nombre válido');
    const res = await fetch('/api/piezas', {
      method: 'POST',
      headers: {
        ...getTokenHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre_pieza })
    });
    const result = await res.json();
    alert(result.message);
    e.target.reset();
    cargarSelect('/api/piezas', piezasSelect); // Actualizar select
    listarPiezas(); // Actualizar tabla
  });

  // Listar piezas en tabla
  const listarPiezas = async () => {
    const tabla = document.getElementById('tablaPiezas');
    const res = await fetch('/api/piezas', { headers: getTokenHeaders() });
    const piezas = await res.json();
    tabla.innerHTML = '';
    piezas.forEach(p => {
      tabla.innerHTML += `
        <tr>
          <td>${p.piezas_id}</td>
          <td>${p.nombre_pieza}</td>
          <td><button class="eliminarPieza" data-id="${p.piezas_id}">🗑️</button></td>
        </tr>`;
    });
  };

  // Eliminar pieza al hacer click en botón correspondiente
  document.getElementById('tablaPiezas').addEventListener('click', async (e) => {
    if (e.target.classList.contains('eliminarPieza')) {
      const id = e.target.dataset.id;
      if (confirm('¿Eliminar pieza?')) {
        const res = await fetch(`/api/piezas/${id}`, {
          method: 'DELETE',
          headers: getTokenHeaders()
        });
        const result = await res.json();
        alert(result.message);
        cargarSelect('/api/piezas', piezasSelect);
        listarPiezas();
      }
    }
  });

  // Similar lógica para tamaños:

  document.getElementById('formTamanio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tamanio = document.getElementById('nuevoTamanio').value.trim();
    if (!tamanio) return alert('Ingresa un tamaño válido');
    const res = await fetch('/api/tamanios', {
      method: 'POST',
      headers: {
        ...getTokenHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tamanio })
    });
    const result = await res.json();
    alert(result.message);
    e.target.reset();
    cargarSelect('/api/tamanios', tamanioSelect);
    listarTamanios();
  });

  const listarTamanios = async () => {
    const tabla = document.getElementById('tablaTamanios');
    const res = await fetch('/api/tamanios', { headers: getTokenHeaders() });
    const tamanios = await res.json();
    tabla.innerHTML = '';
    tamanios.forEach(t => {
      tabla.innerHTML += `
        <tr>
          <td>${t.tamanio_id}</td>
          <td>${t.tamanio}</td>
          <td><button class="eliminarTamanio" data-id="${t.tamanio_id}">🗑️</button></td>
        </tr>`;
    });
  };

  document.getElementById('tablaTamanios').addEventListener('click', async (e) => {
    if (e.target.classList.contains('eliminarTamanio')) {
      const id = e.target.dataset.id;
      if (confirm('¿Eliminar tamaño?')) {
        const res = await fetch(`/api/tamanios/${id}`, {
          method: 'DELETE',
          headers: getTokenHeaders()
        });
        const result = await res.json();
        alert(result.message);
        cargarSelect('/api/tamanios', tamanioSelect);
        listarTamanios();
      }
    }
  });

  // Y para culturas:

  document.getElementById('formCultura').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cultura = document.getElementById('nuevaCultura').value.trim();
    if (!cultura) return alert('Ingresa una cultura válida');
    const res = await fetch('/api/culturas', {
      method: 'POST',
      headers: {
        ...getTokenHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cultura })
    });
    const result = await res.json();
    alert(result.message);
    e.target.reset();
    cargarSelect('/api/culturas', culturaSelect);
    listarCulturas();
  });

  const listarCulturas = async () => {
    const tabla = document.getElementById('tablaCulturas');
    const res = await fetch('/api/culturas', { headers: getTokenHeaders() });
    const culturas = await res.json();
    tabla.innerHTML = '';
    culturas.forEach(c => {
      tabla.innerHTML += `
        <tr>
          <td>${c.cultura_id}</td>
          <td>${c.cultura}</td>
          <td><button class="eliminarCultura" data-id="${c.cultura_id}">🗑️</button></td>
        </tr>`;
    });
  };

  document.getElementById('tablaCulturas').addEventListener('click', async (e) => {
    if (e.target.classList.contains('eliminarCultura')) {
      const id = e.target.dataset.id;
      if (confirm('¿Eliminar cultura?')) {
        const res = await fetch(`/api/culturas/${id}`, {
          method: 'DELETE',
          headers: getTokenHeaders()
        });
        const result = await res.json();
        alert(result.message);
        cargarSelect('/api/culturas', culturaSelect);
        listarCulturas();
      }
    }
  });

  // Cargar datos iniciales al cargar la página
  cargarSelect('/api/piezas', piezasSelect);
  cargarSelect('/api/culturas', culturaSelect);
  cargarSelect('/api/tamanios', tamanioSelect);
  listarProductos();
  listarPiezas();
  listarTamanios();
  listarCulturas();
});