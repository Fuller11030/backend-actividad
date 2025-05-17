const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

      //generar token
      const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
        expiresIn: '2h',
      })
      // Redirigir según rol
      res.json({ 
        mensaje: 'Inicio de sesión exitoso',
        rol: user.rol,
        nombre: user.nombre,
        token
      });
    });
  });
};

//verificar token
exports.verificarToken = (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ mensaje: 'Token no proporcioando' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ mensaje: 'Token inválido' });
    res.json({ mensaje: 'Token válido', datos: decoded });
  });
};