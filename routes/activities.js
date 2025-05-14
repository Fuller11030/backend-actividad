const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

//crear nueva actividad (admin)
router.post('/crear', activityController.crearActividad);

//modificar actividad (admin)
router.put('/modificar', activityController.modificarActividad);

//eliminar actividad (admin)
router.delete('/eliminar', activityController.eliminarActividad);

//aceptar actividad (empleado)
router.post('/aceptar', activityController.aceptarActividad);

//obtener todas las actividades
router.get('/todas', activityController.obtenerActividades);

//buscar actividad por nombre
router.get('/buscar/:nombre', activityController.buscarPorNombre);

module.exports = router;
