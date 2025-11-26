const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const enviarCorreo = require('../config/mailer');

// Registrar nuevo usuario (solo por admin)
exports.crearUsuario = async (req, res) => {
  const { nombre, telefono, email, calle, colonia, numero, rol, area, usuario, contrasena } = req.body;

  // --- 1. VALIDACIONES ---
  
  // Validar teléfono (10 dígitos)
  if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({ mensaje: 'Teléfono inválido. Debe tener exactamente 10 dígitos.' });
  }

  // Validar email
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ mensaje: 'Correo electrónico inválido.' });
  }

  // Validar usuario (al menos una mayúscula)
  if (!/[A-Z]/.test(usuario)) {
    return res.status(400).json({ mensaje: 'El nombre de usuario debe contener al menos una letra mayúscula.' });
  }

  // Validar contraseña (mayúscula y 2 números)
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneDosNumeros = (contrasena.match(/\d/g) || []).length >= 2;

  if (!tieneMayuscula || !tieneDosNumeros) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos una letra mayúscula y dos números.' });
  }

  try {
    // Verificar límite de administradores
    if (rol === 'Administrador') {
      const result = await pool.query(`SELECT COUNT(*) FROM usuarios WHERE rol = 'Administrador'`);
      const cantidadAdmins = parseInt(result.rows[0].count);

      if (cantidadAdmins >= 10) {
        return res.status(403).json({ mensaje: 'Ya hay suficientes administradores registrados (máximo 10).' });
      }
    }

    // --- 2. PREPARAR DATOS ---
    // Encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    // --- 3. GUARDAR EN BASE DE DATOS (CRÍTICO) ---
    // Usamos await aquí porque si falla la BD, sí debemos avisar el error.
    const sql = `
      INSERT INTO usuarios (nombre, telefono, email, calle, colonia, numero, rol, area, usuario, contrasena)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    await pool.query(sql, [nombre, telefono, email, calle, colonia, numero, rol, area, usuario, hash]);

    // --- 4. RESPONDER AL CLIENTE (INMEDIATAMENTE) ⚡ ---
    // Esto hace que la página no se congele. Respondemos éxito aunque el correo no haya salido aún.
    res.status(201).json({ mensaje: 'Usuario creado exitosamente. El correo llegará en breve.' });

    // --- 5. ENVIAR CORREO EN SEGUNDO PLANO (SIN AWAIT) 📨 ---
    console.log(`[FONDO] Iniciando proceso de envío de correo a ${email}...`);
    
    const mensajeHtml = `
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

    // No usamos 'await'. Si falla, se registra en el log pero el usuario no se entera.
    enviarCorreo(email, "Credenciales de acceso - Gedact", mensajeHtml)
      .then(() => console.log(`[EXITO] Correo entregado correctamente a ${email}`))
      .catch(err => console.error(`[ERROR CORREO] Falló el envío a ${email}, pero el usuario YA está registrado. Error: ${err.message}`));

  } catch (err) {
    console.error('Error general al crear usuario:', err.message || err);
    
    // Manejo de error específico: Usuario duplicado
    if (err.code === '23505') {
        // A veces el error no especifica qué campo, pero suele ser el usuario
        return res.status(400).json({ mensaje: 'El nombre de usuario ya está registrado.' });
    }

    // Si ya respondimos (res.json), no podemos responder de nuevo, así que validamos
    if (!res.headersSent) {
        res.status(500).json({
            mensaje: 'Error al crear usuario',
            error: err.message || err
        });
    }
  }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, telefono, email, calle, colonia, numero, rol, area, usuario
      FROM usuarios
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: err.message });
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
    res.status(500).json({ mensaje: 'Error en la búsqueda', error: err.message });
  }
};

// Recuperar contraseña
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