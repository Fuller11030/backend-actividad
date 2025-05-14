/*const { Client } = require('pg'); // Usamos el cliente de PostgreSQL
const dotenv = require('dotenv');
dotenv.config();

console.log("Host:", process.env.DB_HOST);

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false } // Si es necesario por la base de datos en la nube
});

client.connect((err) => {
  if (err) {
    console.error("Error al conectar:", err);
    throw err;
  }
  console.log('Conectado a PostgreSQL');
});

module.exports = client;*/