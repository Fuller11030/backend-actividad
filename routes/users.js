const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
//const bcrypt = require(bcrypt);
//const pool = require('../db');

//ruta para crear un admin por defecto
/*router.get('/crear-admin', async (req, res) => {
    const nombre = 'Uzi';
    const telefono = '1234567890';
    const direccion = 'Enrique segoviano';
    const rol = 'Administrador';
    const area = 'gerencia';
    const usuario = 'admin';
    const contrasena_plana = 'admin123';

    try {
        //verificar si ya existe
        const [existente] = await decodeBase64.execute('SELECT * FROM usuario WHERE usuario = ?', [usuario]);
        if (existente.length > 0) {
            return res.status(400).json({ mensaje: 'El usuario ya existe.' });
        }

        const hash = await bcrypt.hash(contrasena_plana, 10);

        const [resultado] = await db.execute(`
            INSERT INTO usuarios (nombre, telefono, direccion, rol, area, usuario, contrasena)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre, telefono, direccion, rol, area, usuario, hash]
        );

        res.json({ mensaje: 'Usuario administrador creado exitosamente', id: resultado.inserId });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});*/

//crear nuevo usuario
router.post('/crear', userController.crearUsuario);

//obtner todos los usuarios
router.get('/todos', userController.obtenerUsuarios);

//obtner un usuario por nombre
router.get('/buscar/:nombre', userController.buscarPorNombre);

module.exports = router;
