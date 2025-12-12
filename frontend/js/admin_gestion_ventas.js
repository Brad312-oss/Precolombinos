// Espera a que todo el DOM esté cargado para ejecutar las funciones iniciales
document.addEventListener('DOMContentLoaded', async () => {
  verificarAdmin(); // Verifica que el usuario sea administrador antes de continuar
  listarVentas(); // Carga la lista de ventas existentes
  cargarClientes(); // Carga los clientes en el select para registrar ventas
  agregarFilaProducto(); // Agrega una fila para seleccionar productos en el formulario
  // Evento para cuando se envía el formulario de registro de venta
  document.getElementById('formRegistrarVenta').addEventListener('submit', registrarVenta);
  // Evento para agregar una nueva fila de producto al hacer clic en el botón correspondiente
  document.getElementById('agregarProducto').addEventListener('click', agregarFilaProducto);
});

// Función que retorna las cabeceras HTTP necesarias con el token para autenticación
function getTokenHeaders() {
  const token = localStorage.getItem('token'); // Obtener token desde localStorage
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}` // Se incluye el token en la cabecera Authorization
  };
}

// Verifica que el usuario logueado sea administrador (rol 3)
async function verificarAdmin() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/verificar', {
      method: 'GET',
      headers: getTokenHeaders()
    });

    if (!res.ok) throw new Error('Token inválido o expirado');

    const data = await res.json();
    console.log('Usuario verificado:', data);

    if (data.usuario.id_rol !== 3) { // Si el rol no es administrador, redirige
      alert('Acceso denegado');
      window.location.href = '/pages/login.html';
      return false;
    }

    return true; // Usuario es administrador
  } catch (err) {
    console.error(err);
    alert('Sesión inválida');
    window.location.href = '/pages/login.html';
    return false;
  }
}

// Obtiene y muestra la lista de ventas en la tabla correspondiente
async function listarVentas() {
  try {
    const res = await fetch('http://localhost:3000/api/ventas/detalles', {
      method: 'GET',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener ventas');

    const tbody = document.getElementById('tablaVentas');
    tbody.innerHTML = ''; // Limpia tabla antes de agregar datos

    data.forEach(venta => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${venta.venta_id}</td>
        <td>${venta.nombre_cliente}</td>
        <td>${venta.fecha}</td>
        <td>${venta.estado}</td>
        <td>${venta.total}</td>
        <td>
          <button onclick="verDetalleVenta(${venta.venta_id})">Ver Detalle</button>
          <button onclick="mostrarFormularioEstado(${venta.venta_id}, '${venta.estado}')">Actualizar Estado</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar las ventas');
  }
}

// Muestra detalle de productos de una venta en una alerta
async function verDetalleVenta(venta_id) {
  try {
    const res = await fetch(`http://localhost:3000/api/ventas/detalles?id=${venta_id}`, {
      method: 'GET',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    let detalle = 'Productos:\n';
    data.forEach(item => {
      detalle += `- ${item.nombre_producto} (x${item.cantidad}) - $${item.subtotal}\n`;
    });

    alert(detalle);
  } catch (err) {
    console.error(err);
    alert('Error al obtener detalle de venta');
  }
}

// Muestra un prompt para actualizar el estado de una venta y llama a la función para actualizarlo
function mostrarFormularioEstado(venta_id, estadoActual) {
  const nuevoEstado = prompt(`Estado actual: ${estadoActual}\n\nIngrese el nuevo estado (en proceso / entregada / cancelada):`);
  if (nuevoEstado && ['en proceso', 'entregada', 'cancelada'].includes(nuevoEstado)) {
    actualizarEstadoVenta(venta_id, nuevoEstado);
  } else {
    alert('Estado inválido o cancelado');
  }
}

// Actualiza el estado de la venta en el servidor
async function actualizarEstadoVenta(venta_id, nuevoEstado) {
  try {
    const res = await fetch(`http://localhost:3000/api/ventas/actualizar-estado/${venta_id}`, {
      method: 'PUT',
      headers: getTokenHeaders(),
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert('Estado actualizado correctamente');
    listarVentas(); // Refresca la lista para mostrar el nuevo estado
  } catch (err) {
    console.error(err);
    alert('Error al actualizar el estado');
  }
}

// Registra una nueva venta con los productos seleccionados y cantidades indicadas
async function registrarVenta(e) {
  e.preventDefault(); // Evita que el formulario recargue la página

  const token = localStorage.getItem('token');
  const usuario_id = document.getElementById('clienteSelect').value;
  const fecha = new Date().toISOString().split('T')[0]; // Fecha actual formato YYYY-MM-DD
  let total = 0;

  // Obtiene todas las filas de productos agregadas
  const filas = document.querySelectorAll('#productosVenta tbody tr');
  const productos = [];

  filas.forEach(fila => {
    const producto_id = fila.querySelector('.productoSelect').value;
    const cantidad = parseInt(fila.querySelector('.cantidad').value);
    const precio = parseFloat(fila.querySelector('.precio').textContent);

    if (cantidad > 0) {
      const subtotal = cantidad * precio;
      total += subtotal;
      productos.push({ producto_id, cantidad, subtotal });
    }
  });

  if (productos.length === 0) return alert('Agrega al menos un producto.');

  try {
    const res = await fetch('http://localhost:3000/api/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ usuario_id, fecha, total, productos })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Venta registrada correctamente');
      listarVentas(); // Actualiza la lista con la nueva venta
      document.getElementById('formRegistrarVenta').reset(); // Limpia formulario
      document.querySelector('#productosVenta tbody').innerHTML = ''; // Limpia filas de productos
      document.getElementById('totalVenta').textContent = '0.00'; // Reinicia total
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Error de conexión al registrar venta');
  }
}

// Carga los clientes desde el servidor y los añade al select para elegir cliente en la venta
async function cargarClientes() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/usuarios/clientes', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const clientes = await res.json();
    const select = document.getElementById('clienteSelect');
    select.innerHTML = '<option value="">Seleccione un cliente</option>';

    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.usuario_id;
      option.textContent = `${cliente.nombre} ${cliente.apellido}`;
      clienteSelect.appendChild(option);
    });

  } catch (err) {
    console.error('Error al cargar clientes:', err);
  }
}

// Añade una nueva fila en la tabla de productos para registrar venta
function agregarFilaProducto() {
  const tbody = document.querySelector('#productosVenta tbody');

  const tr = document.createElement('tr');

  tr.innerHTML = `
  <td>
    <select class="productoSelect"></select>
  </td>
  <td>
    <input type="number" class="cantidad" min="1" value="1">
  </td>
  <td class="precio">0</td>
  <td class="subtotal">0</td>
  <td><button type="button" class="eliminarFila">🗑️</button></td>
`;

  tbody.appendChild(tr);

  cargarOpcionesProducto(tr.querySelector('.productoSelect'));

  // Evento para eliminar la fila de producto
  tr.querySelector('.eliminarFila').addEventListener('click', () => {
    tr.remove();
    actualizarTotalVenta(); // Actualiza el total cuando se elimina un producto
  });
}

// Carga los productos desde el servidor para llenar el select de productos
async function cargarOpcionesProducto(selectElement) {
  try {
    const res = await fetch('http://localhost:3000/api/productos', {
      headers: getTokenHeaders()
    });
    const productos = await res.json();

    selectElement.innerHTML = '<option value="">Seleccione un producto</option>';

    productos.forEach(producto => {
      const option = document.createElement('option');
      option.value = producto.producto_id;
      option.textContent = `${producto.nombre_pieza} - ${producto.cultura} - ${producto.tamanio} ($${producto.precio})`;
      option.dataset.precio = producto.precio; // Guarda precio para cálculo posterior
      selectElement.appendChild(option);
    });

    // Actualiza subtotal cuando se cambia producto o cantidad
    selectElement.addEventListener('change', actualizarSubtotal);
    selectElement.closest('tr').querySelector('.cantidad').addEventListener('input', actualizarSubtotal);

    function actualizarSubtotal() {
      const fila = selectElement.closest('tr');
      const precio = parseFloat(selectElement.selectedOptions[0].dataset.precio || 0);
      const cantidad = parseInt(fila.querySelector('.cantidad').value || 0);
      const subtotal = precio * cantidad;

      fila.querySelector('.precio').textContent = precio.toFixed(2);
      fila.querySelector('.subtotal').textContent = subtotal.toFixed(2);

      actualizarTotalVenta(); // Actualiza total general
    }

  } catch (err) {
    console.error('Error al cargar opciones de productos:', err);
  }
}

// Suma todos los subtotales de los productos para mostrar el total de la venta
function actualizarTotalVenta() {
  let total = 0;
  document.querySelectorAll('.subtotal').forEach(cell => {
    total += parseFloat(cell.textContent || 0);
  });
  document.getElementById('totalVenta').textContent = total.toFixed(2);
}