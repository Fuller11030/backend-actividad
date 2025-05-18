const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Registrar nuevo usuario (solo por admin)
exports.crearUsuario = async (req, res) => {
  const { nombre, telefono, direccion, rol, area, usuario, contrasena } = req.body;

  if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({ mensaje: 'Teléfono inválido. Debe tener exactamente 10 dígitos.' });
  }

  try {
    const hash = await bcrypt.hash(contrasena, 10);

    const sql = `
      INSERT INTO usuarios (nombre, telefono, direccion, rol, area, usuario, contrasena)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await pool.query(sql, [nombre, telefono, direccion, rol, area, usuario, hash]);

      res.json({ mensaje: 'Usuario creado exitosamente' });
  } catch (err) {
    res.status(500).send(err);
  }
};

//obtner todos los datos de los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, telefono, direccion, rol, area, usuario FROM usuarios
      `);
      res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: err });
  }
};

//buscar un usuario por nombre
exports.buscarPorNombre = async (req, res) => {
  const nombre = req.params.nombre;
  
  try {
    const result = await pool.query(`
      SELECT id, nombre,  telefono, direccion, rol, area
      FROM usuarios
      WHERE nombre ILIKE $1
      `, [`%${nombre}%`]);

      res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en la búsqueda', error: err });
  }
};