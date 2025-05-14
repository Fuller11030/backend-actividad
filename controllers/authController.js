const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Iniciar sesión
exports.login = (req, res) => {
  const { usuario, contrasena } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  db.query(sql, [usuario], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).json({ mensaje: 'Usuario no encontrado' });

    const user = results[0];

    bcrypt.compare(contrasena, user.contrasena, (err, isMatch) => {
      if (err) return res.status(500).send(err);
      if (!isMatch) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

      // Redirigir según rol
      res.json({ mensaje: 'Inicio de sesión exitoso', rol: user.rol, nombre: user.nombre });
    });
  });
};