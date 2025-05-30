const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//crear nuevo usuario
router.post('/crear', userController.crearUsuario);

//obtner todos los usuarios
router.get('/todos', userController.obtenerUsuarios);

//obtner un usuario por nombre
router.get('/buscar/:nombre', userController.buscarPorNombre);

//recuperar contraseña
router.post('/recuperar-contrasena', userController.recuperarContrasena);

module.exports = router;
