const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Iniciar sesión
exports.login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }
    //generar token
    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    //redirigir segun rol
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      rol: user.rol,
      nombre: user.nombre,
      token
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

//verificar token
exports.verificarToken = (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcioando' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ mensaje: 'Token inválido' });
    res.json({ mensaje: 'Token válido', datos: decoded });
  });
};