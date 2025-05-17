document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault(); //evita el envío del formulario por defecto

    const username = document.getElementById("usuario").value;
    const password = document.getElementById("contraseña").value;

    try {
        const response = await fetch('https://backend-actividad-fvub.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: username, contrasena: password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Inicio de sesión exitoso');
            if (data.rol === 'Administrador') {
                window.location.href = 'admin.html';
            } else if (data.rol === 'Empleado') {
                window.location.href = 'empleado.html';
            } else {
                alert('Rol no reconocido');
            }
        } else {
            alert(data.mensaje || 'Error al iniciar sesión');
        } 
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
});