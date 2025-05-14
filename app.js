const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

console.log("PRUEBA: HOST del .env es ->", process.env.DB_HOST);
console.log("PRUEBA: PORT del .env es ->", process.env.DB_PORT);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const reportRoutes = require('./routes/reports');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
