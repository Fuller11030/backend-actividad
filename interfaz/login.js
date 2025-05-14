document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault(); //evita el envío del formulario por defecto

    const email = document.getElementById("usario").value;
    const password = document.getElementById("contraseña").value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST ',
            header: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Inicio de sesión exitoso');
            //redirigir a otra pagina si desea
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al servidor');
    }
});