const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function enviarCorreo(destino, asunto, mensajeHtml) {
    const mailOption = {
        from: `"Gedact" <${process.env.EMAIL_USER}>`,
        to: destino,
        subject: asunto,
        html: mensajeHtml
    };

    return transporter.sendMail(mailOption);
}

module.exports = enviarCorreo;