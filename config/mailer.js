const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración explícita y segura para Gmail
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,               // Puerto seguro SSL (El más fiable en la nube)
    secure: true,            // Usar conexión segura
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificación de conexión (Opcional, pero ayuda a ver en logs si todo está bien al arrancar)
transporter.verify().then(() => {
    console.log('Listo para enviar correos');
}).catch(error => {
    console.error('Error al configurar el correo:', error);
});

async function enviarCorreo(destino, asunto, mensajeHtml) {
    const mailOption = {
        from: `"Gedact" <${process.env.EMAIL_USER}>`,
        to: destino,
        subject: asunto,
        html: mensajeHtml
    };

    try {
        const info = await transporter.sendMail(mailOption);
        console.log("Correo enviado: %s", info.messageId); // Log de éxito
        return info;
    } catch (error) {
        console.error("Error enviando correo:", error);
        throw error; // Lanzamos el error para saber si falló
    }
}

module.exports = enviarCorreo;