const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // Servidor de Brevo
    port: 587,                    // Puerto estándar (Render lo deja pasar sin problemas)
    secure: false,                // false es correcto para puerto 587
    auth: {
        user: process.env.EMAIL_USER, // Tu correo
        pass: process.env.EMAIL_PASS  // Tu clave SMTP de Brevo
    }
});

// Verificamos conexión al iniciar (para ver el Log en Render)
transporter.verify().then(() => {
    console.log('Conectado al servidor de correos de Brevo');
}).catch(error => {
    console.error('Error configurando Brevo:', error);
});

async function enviarCorreo(destino, asunto, mensajeHtml) {
    const mailOption = {
        from: `"Gedact" <${process.env.EMAIL_USER}>`, // El remitente
        to: destino,
        subject: asunto,
        html: mensajeHtml
    };

    try {
        const info = await transporter.sendMail(mailOption);
        console.log("Correo enviado: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error enviando correo:", error);
        throw error;
    }
}

module.exports = enviarCorreo;