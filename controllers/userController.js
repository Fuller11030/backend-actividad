const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Registrar nuevo usuario (solo por admin)
exports.crearUsuario = (req, res) => {
  const { nombre, telefono, direccion, rol, area, usuario, contrasena } = req.body;

  if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({ mensaje: 'Teléfono inválido. Debe tener exactamente 10 dígitos.' });
  }

  bcrypt.hash(contrasena, 10, (err, hash) => {
    if (err) return res.status(500).send(err);

    const sql = `INSERT INTO usuarios (nombre, telefono, direccion, rol, area, usuario, contrasena) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [nombre, telefono, direccion, rol, area, usuario, hash], (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ mensaje: 'Usuario creado exitosamente' });
    });
  });
};

//obtner todos los datos de los usuarios
exports.obtenerUsuarios = (req, res) => {
  const sql = `SELECT id, nombre, telefono, direccion, rol, area, usuario FROM usuarios`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener usuarios', error: err });
    res.json(results);
  });
};

//buscar un usuario por nombre
exports.buscarPorNombre = (req, res) => {
  const nombre = req.params.nombre;
  const sql = `SELECT id, nombre, telefono, direccion, rol, area FROM usuarios WHERE nombre LIKE ?`;

  db.query(sql, [`%${nombre}%`], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error en la búsqueda', error: err });
    res.json(results);
  });
};