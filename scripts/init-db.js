const fs = require("node:fs/promises");
const path = require("node:path");
const { Client } = require("pg");
const { connection, schema } = require("../config/environment.js");
async function inicializar() {
  const client = new Client({ ...connection, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await client.query(`SET LOCAL search_path TO "${schema}"`);
    for (const file of ["schema.sql", "seed.sql"])
      await client.query(
        await fs.readFile(path.join(__dirname, "../db", file), "utf8"),
      );
    await client.query("COMMIT");
    console.log(
      `✅ Esquema ${schema}, tablas y datos de ejemplo listos. Las tablas de public se conservan.`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(
      `❌ No se pudo inicializar la base de datos: ${error.message}`,
    );
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
inicializar();
