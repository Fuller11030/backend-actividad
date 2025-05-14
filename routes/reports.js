const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/crear', reportController.crearReporte);
router.post('/monitorear', reportController.monitorear);
router.post('/generar-pdf', reportController.generarPDF);
router.post('/ultimo', reportController.obtenerUltimo);
router.post('/todos', reportController.obtenerTodos);

module.exports = router;