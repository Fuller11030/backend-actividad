const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // Aseguramos que sea Brevo
    port: 2525,                   // Puerto alternativo anti-bloqueos
    secure: false,                // false es correcto para 2525
    auth: {
        user: process.env.EMAIL_USER, // Tu correo de login de Brevo
        pass: process.env.EMAIL_PASS  // Tu clave SMTP de Brevo (la larga)
    },
    // Opciones extra para conexiones lentas
    connectionTimeout: 10000, 
    greetingTimeout: 10000
});

// Verificación de conexión al iniciar
transporter.verify().then(() => {
    console.log('✅ Conectado a Brevo en puerto 2525');
}).catch(error => {
    console.error('❌ Error conectando a Brevo:', error.message);
});

async function enviarCorreo(destino, asunto, mensajeHtml) {
    const mailOption = {
        from: `"Gedact" <${process.env.EMAIL_USER}>`,
        to: destino,
        subject: asunto,
        html: mensajeHtml
    };

    try {
        console.log(`[MAILER] Enviando a ${destino} vía Brevo:2525...`);
        const info = await transporter.sendMail(mailOption);
        console.log("📨 Correo enviado ID: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Error en mailer:", error.message);
        throw error;
    }
}

module.exports = enviarCorreo;