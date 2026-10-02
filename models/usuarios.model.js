const pool = require("../config/db.js");

const obtenerTodos = async () => {
  const query = "SELECT id, nombre, email, created_at FROM usuarios;";
  const result = await pool.query(query);
  return result.rows;
};

const obtenerPorId = async (id) => {
  const query =
    "SELECT id, nombre, email, created_at FROM usuarios WHERE id = $1;";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const actualizar = async (id, nombre, email) => {
  const query =
    "UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING id, nombre, email, created_at;";
  const result = await pool.query(query, [nombre, email, id]);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query =
    "DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email;";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crearConPerfil = async (nombre, email, biografia) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Inicio de la transacción

    // Acción 1: Crear usuario
    const insertUsuarioQuery =
      "INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING id, nombre, email;";
    const usuarioResult = await client.query(insertUsuarioQuery, [
      nombre,
      email,
    ]);
    const nuevoUsuario = usuarioResult.rows[0];

    // Acción 2: Crear perfil asociado usando el ID recién generado
    const insertPerfilQuery =
      "INSERT INTO perfiles (usuario_id, biografia) VALUES ($1, $2) RETURNING id, biografia;";
    const perfilResult = await client.query(insertPerfilQuery, [
      nuevoUsuario.id,
      biografia,
    ]);

    await client.query("COMMIT"); // Confirmación de la transacción

    return {
      usuario: nuevoUsuario,
      perfil: perfilResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK"); // Cancelación ante cualquier falla
    throw error;
  } finally {
    client.release(); // Liberación obligatoria del cliente al pool
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
  crearConPerfil,
};
