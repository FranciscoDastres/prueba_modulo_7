const { Pool } = require("pg");
const { connection, schema } = require("./environment.js");

const pool = new Pool({
  ...connection,
  options: `-c search_path=${schema}`,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
});

pool.on("connect", () => {
  console.log(`✅ Conexión exitosa a PostgreSQL (esquema ${schema})`);
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en la base de datos:", err.message);
});

module.exports = pool;
