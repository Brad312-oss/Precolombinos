// Función para filtrar y mostrar el reporte de ventas según filtros seleccionados
async function filtrarReporte() {
  try {
    // Obtener token guardado en localStorage para autenticación
    const token = localStorage.getItem('token');

    // Crear parámetros para la URL con los valores de los filtros del formulario
    const params = new URLSearchParams({
      comprador: document.getElementById('filtroComprador').value,
      cultura: document.getElementById('filtroCultura').value,
      producto: document.getElementById('filtroProducto').value,
      estado: document.getElementById('filtroEstado').value,
      fechaInicio: document.getElementById('fechaInicio').value,
      fechaFin: document.getElementById('fechaFin').value
    });

    // Realizar petición GET a la API con los filtros y token en el header
    const res = await fetch(`/api/ventas/reporte/filtrado?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Convertir respuesta en JSON
    const datos = await res.json();

    // Referencia a la tabla donde se mostrará el reporte
    const tabla = document.getElementById('tablaReporteVentas');
    tabla.innerHTML = ''; // Limpiar contenido previo

    // Objeto para agrupar ventas por su id y organizar productos dentro de cada venta
    const ventasAgrupadas = {};

    // Verificar que la respuesta sea un array
    if (Array.isArray(datos)) {
      // Recorrer cada registro para agrupar datos
      datos.forEach(item => {
        // Si la venta no existe aún en el objeto, crear la estructura
        if (!ventasAgrupadas[item.venta_id]) {
          ventasAgrupadas[item.venta_id] = {
            cliente: `${item.cliente_nombre} ${item.cliente_apellido}`, // Nombre completo del cliente
            fecha: item.fecha,
            estado: item.estado,
            total: item.total,
            productos: [], // Aquí se almacenan los productos asociados a la venta
          };
        }
        // Agregar producto actual a la lista de productos de la venta
        ventasAgrupadas[item.venta_id].productos.push({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        });
      });
    } else {
      alert('Error: no se pudo cargar el reporte.');
      return;
    }

    // Crear filas de la tabla por cada venta agrupada
    Object.entries(ventasAgrupadas).forEach(([id, venta]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${id}</td>
        <td>${venta.cliente}</td>
        <td>${venta.fecha}</td>
        <td>${venta.estado}</td>
        <td>$${venta.total}</td>
        <td>
          <ul>
            ${venta.productos.map(p => `<li>${p.descripcion} (x${p.cantidad}) - $${p.subtotal}</li>`).join('')}
          </ul>
        </td>
      `;
      tabla.appendChild(tr);
    });

  } catch (error) {
    // Manejo de errores y mostrar mensaje en consola
    console.error('Error cargando el reporte de ventas:', error);
  }
}

// Función similar a la anterior para otro conjunto de filtros y tabla distinta
async function filtrarReporte2() {
  try {
    const token = localStorage.getItem('token');

    // Parámetros obtenidos de inputs con sufijo 2
    const params = new URLSearchParams({
      comprador: document.getElementById('filtroComprador2').value,
      cultura: document.getElementById('filtroCultura2').value,
      producto: document.getElementById('filtroProducto2').value,
      estado: document.getElementById('filtroEstado2').value,
      fechaInicio: document.getElementById('fechaInicio2').value,
      fechaFin: document.getElementById('fechaFin2').value
    });

    // Solicitud fetch con filtros y token
    const res = await fetch(`/api/ventas/reporte/filtrado?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const datos = await res.json();

    // Limpiar tabla de resultados
    const tabla = document.getElementById('tablaReporteVentas2');
    tabla.innerHTML = '';

    const ventasAgrupadas = {};

    if (Array.isArray(datos)) {
      datos.forEach(item => {
        if (!ventasAgrupadas[item.venta_id]) {
          ventasAgrupadas[item.venta_id] = {
            cliente: `${item.cliente_nombre} ${item.cliente_apellido}`,
            fecha: item.fecha,
            estado: item.estado,
            total: item.total,
            productos: [],
          };
        }
        ventasAgrupadas[item.venta_id].productos.push({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        });
      });
    } else {
      alert('Error: no se pudo cargar el reporte.');
      return;
    }

    // Insertar filas en tabla con datos agrupados
    Object.entries(ventasAgrupadas).forEach(([id, venta]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${id}</td>
        <td>${venta.cliente}</td>
        <td>${venta.fecha}</td>
        <td>${venta.estado}</td>
        <td>$${venta.total}</td>
        <td>
          <ul>
            ${venta.productos.map(p => `<li>${p.descripcion} (x${p.cantidad}) - $${p.subtotal}</li>`).join('')}
          </ul>
        </td>
      `;
      tabla.appendChild(tr);
    });

  } catch (error) {
    console.error('Error cargando el reporte de ventas:', error);
  }
}

// Al cargar el DOM, agregamos eventos click a los botones para filtrar reportes
document.addEventListener('DOMContentLoaded', () => {
  const btn1 = document.getElementById('btnFiltrar1');
  const btn2 = document.getElementById('btnFiltrar2');

  if (btn1) btn1.addEventListener('click', filtrarReporte);
  if (btn2) btn2.addEventListener('click', filtrarReporte2);
});

// Función para generar reporte de usuarios entre dos fechas
async function generarReporteUsuarios() {
  // Obtener fechas seleccionadas para el reporte
  const fechaInicio = document.getElementById('fechaInicioUsuarios').value;
  const fechaFin = document.getElementById('fechaFinUsuarios').value;

  // Validar que ambas fechas estén seleccionadas
  if (!fechaInicio || !fechaFin) {
    alert('Por favor selecciona ambas fechas para generar el reporte.');
    return;
  }

  try {
    // Obtener token y hacer la petición a la API
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/usuarios/reporte/usuarios?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    // Validar respuesta correcta
    if (!res.ok) throw new Error(data.message || 'Error al obtener estadísticas');

    const { resumen, detalle } = data;

    // Mostrar datos generales del resumen
    document.getElementById('totalNuevos').textContent = resumen.total_nuevos;
    document.getElementById('totalBaneados').textContent = resumen.total_baneados;

    // Mostrar resumen agrupado por rol de usuario
    const contenedorRoles = document.getElementById('resumenPorRol');
    contenedorRoles.innerHTML = '';
    resumen.porRol.forEach(({ rol, cantidad }) => {
      const p = document.createElement('p');
      p.textContent = `🔸 ${rol}: ${cantidad} usuario(s)`;
      contenedorRoles.appendChild(p);
    });

    // Mostrar detalle de usuarios en la tabla
    const tabla = document.getElementById('tablaUsuariosReporte');
    tabla.innerHTML = '';
    detalle.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.usuario_id}</td>
        <td>${u.nombre}</td>
        <td>${u.correo}</td>
        <td>${u.rol}</td>
        <td>${u.estado}</td>
        <td>${u.fecha_registro}</td>
        <td>${u.last_login || '—'}</td>
      `;
      tabla.appendChild(tr);
    });
  } catch (err) {
    // Mostrar error en consola y alerta al usuario
    console.error('Error al obtener estadísticas de usuarios:', err);
    alert('Error al generar el reporte de usuarios.');
  }
}

// Agregar evento click para generar reporte de usuarios
document.getElementById('btnFiltrarUsuarios')
        .addEventListener('click', generarReporteUsuarios);

// Función para generar reporte general de productos
async function generarReporteProductos() {
  try {
    const token = localStorage.getItem('token');
    // Solicitud a la API para obtener reporte de productos
    const res = await fetch('http://localhost:3000/api/productos/reporte/productos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener reporte de productos');

    const productos = data.productos;
    const tabla = document.getElementById('tablaReporteProductos');
    tabla.innerHTML = ''; // Limpiar tabla

    // Recorrer productos y agregarlos como filas a la tabla
    productos.forEach(p => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.producto_id}</td>
        <td>${p.nombre}</td>
        <td>${p.stock}</td>
        <td>$${p.precio}</td>
        <td>${p.estado || 'No definido'}</td>
        <td>${p.admin_nombre ? `${p.admin_nombre} ${p.admin_apellido}` : '—'}</td>
        <td>${p.ultima_modificacion}</td>
      `;
      tabla.appendChild(fila);
    }); 
  } catch (err) {
    // Mostrar errores y alerta al usuario en caso de fallo
    console.error('Error al obtener reporte de productos:', err);
    alert('Error al generar el reporte de productos.');
  }
}

// Agregar evento click para generar reporte de productos
document.getElementById('btnGenerarReporteProductos')
        .addEventListener('click', generarReporteProductos);