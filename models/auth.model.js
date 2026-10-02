const pool = require("../config/db.js");

const buscarPorEmail = async (email) => {
  const query =
    "SELECT id, nombre, email, password, imagen FROM usuarios WHERE email = $1;";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const registrarUsuario = async (nombre, email, passwordHash) => {
  const query =
    "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, imagen;";
  const result = await pool.query(query, [nombre, email, passwordHash]);
  return result.rows[0];
};

const actualizarImagen = async (id, nombreArchivo) => {
  const query =
    "UPDATE usuarios SET imagen = $1 WHERE id = $2 RETURNING id, nombre, email, imagen;";
  const result = await pool.query(query, [id, nombreArchivo]);
  return result.rows[0];
};

module.exports = {
  buscarPorEmail,
  registrarUsuario,
  actualizarImagen,
};
