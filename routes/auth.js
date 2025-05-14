const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

//verificar token
router.get('/verificar', authController.verificarToken);

module.exports = router;