// Función para obtener el valor de un elemento por su id
// Si no encuentra el elemento, lanza un error
const getValue = (id) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Elemento con id="${id}" no encontrado`);
    return el.value;
};

document.addEventListener('DOMContentLoaded', function () {
    // Obtiene el formulario de registro por su id
    const form = document.getElementById('registroForm');
    if (!form) {
        // Si no se encuentra el formulario, muestra error y termina la ejecución
        console.error('Formulario no encontrado');
        return;
    }

    // Escucha el evento submit del formulario
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Previene el envío tradicional y recarga de página

        try {
            // Obtiene los valores de los campos del formulario usando la función getValue
            const nombre = getValue('nombre');
            const apellido = getValue('apellido');
            const correo = getValue('correo');
            const cedula = getValue('cedula');
            const telefono = getValue('telefono');
            const direccion = getValue('direccion');
            const fecha_registro = getValue('fecha_registro');
            const contraseña = getValue('contrasena');

            // Envía los datos al servidor con una petición POST para registrar al usuario
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Indica que se envía JSON
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    correo,
                    cedula,
                    telefono,
                    direccion,
                    fecha_registro,
                    contraseña
                })
            });

            const text = await response.text(); // Obtiene la respuesta como texto

            try {
                // Intenta convertir la respuesta a JSON
                const data = JSON.parse(text);

                if (response.ok) {
                    // Si la respuesta es exitosa, alerta y redirige al login
                    alert('Registro exitoso');
                    window.location.href = 'login.html';
                } else {
                    // Si hay error, muestra el mensaje del servidor o uno genérico
                    alert(data.message || 'Error al registrar');
                }
            } catch (e) {
                // Si la respuesta no es JSON, muestra un error en consola y alerta al usuario
                console.error('Respuesta inesperada del servidor:', text);
                alert('Error inesperado: la respuesta no es JSON');
            }

        } catch (error) {
            // Captura errores de conexión u otros y muestra alert y consola
            console.error('Error:', error);
            alert(error.message || 'Hubo un problema al conectar con el servidor');
        }
    });
});