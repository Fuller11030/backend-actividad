/*const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

console.log("Host:", process.env.DB_HOST);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error("Error al conectar:", err);
    throw err;
  }
});

module.exports = connection;*/