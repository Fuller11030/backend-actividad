const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 2525, 
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER, // El código raro (9c8747001...)
        pass: process.env.EMAIL_PASS  // La clave larga (xsmtpsib...)
    },
    connectionTimeout: 10000, 
    greetingTimeout: 10000
});

async function enviarCorreo(destino, asunto, mensajeHtml) {
    const mailOption = {
        // --- CAMBIO IMPORTANTE AQUÍ ---
        // Ya no usamos process.env.EMAIL_USER aquí.
        // Ponemos TU correo real (el que verificaste en Brevo).
        from: `"Gedact App" <fullerdawn2311030@gmail.com>`, 
        to: destino,
        subject: asunto,
        html: mensajeHtml
    };

    try {
        console.log(`[MAILER] Enviando a ${destino} vía Brevo...`);
        const info = await transporter.sendMail(mailOption);
        console.log("📨 Correo aceptado por Brevo ID: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Error en mailer:", error.message);
        throw error;
    }
}

module.exports = enviarCorreo;