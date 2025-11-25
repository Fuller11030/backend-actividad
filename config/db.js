const { Pool } = require('pg');
require('dotenv').config();

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD', process.env.DB_PASSWORD);
console.log('DB_PORT', process.env.DB_PORT);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente de la base de datos (inactivo)', err);
});


pool.connect()
.then(client => { 
  console.log('Conectado a la base de datos');
  client.release();
})
.catch(err => {
  console.error('Error al conectar a la base de datos:', err.message);
});

module.exports = pool;