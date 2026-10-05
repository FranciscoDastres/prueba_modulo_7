require("dotenv").config({ quiet: true });
const schema = process.env.DB_SCHEMA || "modulo7";
if (!/^[a-z_][a-z0-9_]{0,62}$/.test(schema))
  throw new Error(
    "DB_SCHEMA debe ser un identificador PostgreSQL válido en minúsculas.",
  );
module.exports = {
  schema,
  connection: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
  },
};
