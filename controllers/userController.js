const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const enviarCorreo = require('../config/mailer');

// Registrar nuevo usuario (solo por admin)
exports.crearUsuario = async (req, res) => {
  const { nombre, telefono, email, calle, colonia, numero, rol, area, usuario, contrasena } = req.body;

  // Validar teléfono
  if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({ mensaje: 'Teléfono inválido. Debe tener exactamente 10 dígitos.' });
  }

  // Validar email
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ mensaje: 'Correo electrónico inválido.' });
  }

  // Validar usuario con mayúscula
  if (!/[A-Z]/.test(usuario)) {
    return res.status(400).json({ mensaje: 'El nombre de usuario debe contener al menos una letra mayúscula.' });
  }

  // Validar contraseña
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneDosNumeros = (contrasena.match(/\d/g) || []).length >= 2;

  if (!tieneMayuscula || !tieneDosNumeros) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos una letra mayúscula y dos números.' });
  }

  try {
    if (rol === 'Administrador') {
      const result = await pool.query(`SELECT COUNT(*) FROM usuarios WHERE rol = 'Administrador'`);
      const cantidadAdmins = parseInt(result.rows[0].count);

      if (cantidadAdmins >= 10) {
        return res.status(403).json({mensaje: 'Ya hay suficientes administradores registrados (máximo 10).' });
      }
    }
    
    const hash = await bcrypt.hash(contrasena, 10);

    const sql = `
      INSERT INTO usuarios (nombre, telefono, email, calle, colonia, numero, rol, area, usuario, contrasena)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    await pool.query(sql, [ nombre, telefono, email, calle, colonia, numero, rol, area, usuario, hash]);
//esto es nuevo
    try {
      console.log(`[INFO] Intentando enviar correo a: ${email}...`);
      
      const mensaje = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2c3e50;">¡Bienvenido/a ${nombre}!</h2>
          <p>Tu cuenta en <strong>Gedact</strong> ha sido creada correctamente.</p>
          <hr>
          <p><strong>Usuario:</strong> ${usuario}</p>
          <p><strong>Contraseña:</strong> ${contrasena}</p>
          <hr>
          <p style="font-size: 12px; color: #7f8c8d;">Por favor guarda esta información en un lugar seguro.</p>
        </div>
      `;

      await enviarCorreo(email, "Credenciales de acceso - Gedact", mensaje);
      console.log(`[EXITO] Correo enviado correctamente a ${email}`);
      
    } catch (errorCorreo) {
      // Si falla el correo, lo mostramos en consola PERO NO detenemos el éxito del registro
      console.error(`[ERROR CORREO] El usuario se creó, pero falló el envío del email:`, errorCorreo.message);
    }

    // Responder al cliente
    res.json({ mensaje: 'Usuario creado exitosamente' });

  } catch (err) {
    console.error('Error general al crear usuario:', err.message || err);
    
    // Si es error de duplicado (usuario ya existe)
    if (err.code === '23505') {
        return res.status(400).json({ mensaje: 'El nombre de usuario ya está registrado.' });
    }

    res.status(500).json({
      mensaje: 'Error al crear usuario',
      error: err.message || err
    });
  }
};

// Obtener todos los usuarios (actualizado con email y datos separados)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, telefono, email, calle, colonia, numero, rol, area, usuario
      FROM usuarios
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: err });
  }
};

// Buscar usuarios por nombre
exports.buscarPorNombre = async (req, res) => {
  const nombre = req.params.nombre;

  try {
    const result = await pool.query(`
      SELECT id, nombre, telefono, email, calle, colonia, numero, rol, area, usuario
      FROM usuarios
      WHERE nombre ILIKE $1
    `, [`%${nombre}%`]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en la búsqueda', error: err });
  }
};

//recuperar contraseña
exports.recuperarContrasena = async (req, res) => {
  const { usuario, nuevaContrasena } = req.body;

  if (!usuario || !nuevaContrasena) {
    return res.status(400).json({ mensaje: 'Debes completar todos los campos.' });
  }

  const tieneMayuscula = /[A-Z]/.test(nuevaContrasena);
  const tieneDosNumeros = (nuevaContrasena.match(/\d/g) || []).length >= 2;

  if (!tieneMayuscula || !tieneDosNumeros) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos una letra mayúscula y dos números.' });
  }

  try {
    const hash = await bcrypt.hash(nuevaContrasena, 10);

    const result = await pool.query(
      `UPDATE usuarios SET contrasena = $1 WHERE usuario = $2`,
      [hash, usuario]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.json({ mensaje: 'Contraseña actualizada exitosamente.' });
  } catch (err) {
    console.error('Error al recuperar contraseña:', err.message || err);
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
};
