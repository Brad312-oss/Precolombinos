// Obtener el token almacenado en el navegador para autenticación
const token = localStorage.getItem('token');
// Variable booleana para saber si el usuario está autenticado (token existe)
const usuarioAutenticado = !!token;

// Carrito vacío donde se almacenarán los productos seleccionados
const carrito = [];
// Array para almacenar el catálogo de productos traído del servidor
let catalogoProductos = [];

// Evento que carga el catálogo de productos cuando el DOM está listo
document.addEventListener('DOMContentLoaded', cargarCatalogo);

// Función asíncrona para obtener el catálogo de productos desde la API
async function cargarCatalogo() {
  try {
    // Realiza la petición a la API, incluyendo el token si el usuario está autenticado
    const res = await fetch('http://localhost:3000/api/productos', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    // Convierte la respuesta en JSON (lista de productos)
    const productos = await res.json();
    // Guarda los productos en la variable global para usarlos luego
    catalogoProductos = productos;

    // Selecciona el contenedor donde se mostrarán los productos
    const contenedor = document.getElementById('catalogo');
    contenedor.innerHTML = ''; // Limpia el contenido previo

    // Recorre cada producto para crear su tarjeta HTML
    productos.forEach(prod => {
      const card = document.createElement('div');
      card.classList.add('producto-card'); // Clase CSS para estilo

      // Crea el contenido HTML de cada tarjeta con información del producto
      card.innerHTML = `
      <img src="http://localhost:3000${prod.imagen}" alt="${prod.descripcion}">
      <p><strong>Cultura:</strong> ${prod.cultura}</p>
      <p><strong>Pieza:</strong> ${prod.pieza}</p>
      <p><strong>Tamaño:</strong> ${prod.tamanio}</p>
      <p><strong>Precio:</strong> $${prod.precio}</p>
      <p><strong>Stock:</strong> ${prod.stock}</p>
      ${
        usuarioAutenticado 
          ? `  <!-- Mostrar inputs y botones solo si está autenticado -->
              <label for="cantidad-${prod.producto_id}">Cantidad:</label>
              <input type="number" min="1" max="${prod.stock}" value="1" id="cantidad-${prod.producto_id}">
              <button onclick="verDetalle(${prod.producto_id})">Ver Detalle</button>
              <button onclick="agregarAlCarrito(${prod.producto_id})">Agregar al carrito</button>
            `
          : `  <!-- Solo mostrar botón para ver detalle si no está autenticado -->
              <button onclick="verDetalle(${prod.producto_id})">Ver Detalle</button>
            `
      }
      `;

      // Añade la tarjeta creada al contenedor principal
      contenedor.appendChild(card);
    });

    // Actualiza el total del carrito en la interfaz
    actualizarTotalCarrito();

  } catch (err) {
    // Captura y muestra errores en la consola si la petición falla
    console.error('Error cargando productos', err);
  }
}

// Función para mostrar el detalle completo de un producto (modal)
window.verDetalle = async function(id) {
  try {
    // Solicita detalle del producto por id a la API, con autorización
    const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const prod = await res.json();

    // Crea el HTML del modal con la información detallada
    const detalleHTML = `
      <div class="detalle-modal">
        <h3>${prod.nombre_pieza} - ${prod.cultura} - ${prod.tamanio}</h3>
        <img src="http://localhost:3000${prod.imagen}" alt="${prod.descripcion}">
        <p><strong>Descripción:</strong> ${prod.descripcion}</p>
        <p><strong>Precio:</strong> $${prod.precio}</p>
        <p><strong>Stock:</strong> ${prod.stock}</p>
        <button onclick="cerrarDetalle()">Cerrar</button>
      </div>
    `;

    // Crea y muestra el modal en el DOM
    const modal = document.createElement('div');
    modal.id = 'modalDetalle';
    modal.classList.add('modal');
    modal.innerHTML = detalleHTML;
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error al obtener detalle:', error);
  }
};

// Función para cerrar el modal de detalle
window.cerrarDetalle = function() {
  const modal = document.getElementById('modalDetalle');
  if (modal) modal.remove(); // Elimina el modal si existe
};

// Función para agregar un producto al carrito
window.agregarAlCarrito = function(producto_id) {
  const inputCantidad = document.getElementById(`cantidad-${producto_id}`);
  const cantidad = parseInt(inputCantidad.value);

  // Validación de cantidad
  if (isNaN(cantidad) || cantidad < 1) {
    return alert('Cantidad inválida.');
  }

  // Busca el producto en el catálogo para verificar stock y detalles
  const producto = catalogoProductos.find(p => p.producto_id === producto_id);
  if (!producto) return alert('Producto no encontrado.');

  // Verifica si el producto ya está en el carrito
  const existente = carrito.find(p => p.producto_id === producto_id);
  const cantidadDeseada = existente ? existente.cantidad + cantidad : cantidad;

  // Verifica que la cantidad solicitada no supere el stock disponible
  if (cantidadDeseada > producto.stock) {
    return alert(`Stock insuficiente para "${producto.nombre_pieza}". Disponible: ${producto.stock}, solicitando: ${cantidadDeseada}`);
  }

  // Calcula el subtotal de este producto
  const subtotal = cantidad * producto.precio;

  // Actualiza el carrito sumando la cantidad o agrega un nuevo producto
  if (existente) {
    existente.cantidad += cantidad;
    existente.subtotal += subtotal;
  } else {
    carrito.push({
      producto_id,
      cantidad,
      subtotal,
      nombre_pieza: producto.nombre_pieza,
      cultura: producto.cultura,
      tamanio: producto.tamanio,
      precio: producto.precio,
      stock: producto.stock
    });
  }

  alert('Producto agregado al carrito.');
  // Actualiza la suma total visible del carrito
  actualizarTotalCarrito();
};

// Función que calcula y actualiza el total del carrito en la interfaz
function actualizarTotalCarrito() {
  // Suma todos los subtotales de los productos en el carrito
  const total = carrito.reduce((acc, p) => acc + p.subtotal, 0);
  const totalSpan = document.getElementById('total-carrito');
  if (totalSpan) totalSpan.textContent = total.toFixed(2);
}

// Evento para el botón de compra que ejecuta la función confirmarCompra
document.getElementById('comprarBtn').addEventListener('click', confirmarCompra);

// Función asíncrona que procesa la compra al enviar los datos a la API
async function confirmarCompra() {
  // Validar que el carrito no esté vacío
  if (carrito.length === 0) {
    return alert('Tu carrito está vacío.');
  }

  // Obtener el tipo de pago seleccionado
  const tipoPago = document.getElementById('tipoPago').value;
  if (!tipoPago) return alert('Debes seleccionar un tipo de pago.');

  // Decodificar token para obtener el ID del usuario
  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const usuario_id = Number(tokenPayload.id);
  const total = carrito.reduce((acc, p) => acc + p.subtotal, 0);
  // Obtener la fecha actual en formato YYYY-MM-DD
  const fecha = new Date().toISOString().slice(0, 10);

  try {
    // Enviar los datos de la venta a la API con método POST
    const res = await fetch('http://localhost:3000/api/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        usuario_id,
        fecha,
        total,
        tipo_pago: tipoPago,
        productos: carrito
      })
    });

    const data = await res.json();

    // Si la respuesta fue exitosa, mostrar mensaje y limpiar carrito
    if (res.ok) {
      alert('Compra realizada con éxito. Gracias por tu pago con ' + tipoPago);

      const productosComprados = [...carrito];
      carrito.length = 0; // Vaciar el carrito
      cargarCatalogo();   // Recargar catálogo para actualizar stock
      
      // Mostrar recibo de compra en una nueva ventana
      mostrarRecibo({
        fecha,
        total,
        tipo_pago: tipoPago,
        productos: productosComprados
      });
    } else {
      // Si hubo error, mostrar mensaje recibido
      alert(data.message || 'Error al procesar la compra.');
    }
  } catch (err) {
    console.error('Error al confirmar compra:', err);
  }
}

// Función para mostrar el recibo de compra en una ventana emergente
function mostrarRecibo(detalleCompra) {
  const reciboWindow = window.open('', 'Recibo', 'width=600,height=600');
  let html = `<h2>Recibo de Compra</h2>`;
  html += `<p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>`;
  html += `<p><strong>Tipo de Pago:</strong> ${detalleCompra.tipo_pago}</p>`;
  html += `<table border="1" cellpadding="5" cellspacing="0">
    <tr>
      <th>Pieza</th>
      <th>Cultura</th>
      <th>Tamaño</th>
      <th>Precio Unitario</th>
      <th>Cantidad</th>
      <th>Subtotal</th>
    </tr>`;

  // Agrega una fila para cada producto comprado
  detalleCompra.productos.forEach(producto => {
    const precio = parseFloat(producto.precio) || 0;
    const cantidad = parseInt(producto.cantidad) || 0;
    const subtotalCalculado = producto.subtotal ?? (precio * cantidad);
    const subtotalFixed = subtotalCalculado.toFixed(2);

    html += `<tr>
      <td>${producto.nombre_pieza}</td>
      <td>${producto.cultura}</td>
      <td>${producto.tamanio}</td>
      <td>$${precio.toFixed(2)}</td>
      <td>${cantidad}</td>
      <td>$${subtotalFixed}</td>
    </tr>`;
  });

  html += `</table>`;
  html += `<h3>Total: $${parseFloat(detalleCompra.total).toFixed(2)}</h3>`;
  reciboWindow.document.body.innerHTML = html;
}