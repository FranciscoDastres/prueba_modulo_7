const usuarioModel = require("../models/usuarios.model.js");

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioModel.obtenerTodos();
    return res.status(200).json({
      status: "success",
      message: "Usuarios obtenidos correctamente",
      data: usuarios,
    });
  } catch (error) {
    console.error(`Error al obtener usuarios: ${error.message}`);
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
};

const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body;

  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Debes proporcionar un ID válido." });
  }

  if (!nombre || !email) {
    return res.status(400).json({
      status: "error",
      message: "Los campos 'nombre' y 'email' son obligatorios.",
    });
  }

  try {
    const usuarioExistente = await usuarioModel.obtenerPorId(parseInt(id));
    if (!usuarioExistente) {
      return res
        .status(404)
        .json({ status: "error", message: "El usuario no existe." });
    }

    const usuarioActualizado = await usuarioModel.actualizar(
      parseInt(id),
      nombre,
      email,
    );
    return res.status(200).json({
      status: "success",
      message: "Usuario actualizado correctamente.",
      data: usuarioActualizado,
    });
  } catch (error) {
    console.error(`Error al actualizar usuario: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al actualizar.",
    });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Debes proporcionar un ID válido." });
  }

  try {
    const usuarioEliminado = await usuarioModel.eliminar(parseInt(id));
    if (!usuarioEliminado) {
      return res
        .status(404)
        .json({ status: "error", message: "El usuario no existe." });
    }

    return res.status(200).json({
      status: "success",
      message: "Usuario eliminado correctamente.",
      data: usuarioEliminado,
    });
  } catch (error) {
    console.error(`Error al eliminar usuario: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al eliminar.",
    });
  }
};

const registrarUsuarioConPerfil = async (req, res) => {
  const { nombre, email, biografia } = req.body;

  if (!nombre || !email || !biografia) {
    return res.status(400).json({
      status: "error",
      message: "Los campos 'nombre', 'email' y 'biografia' son obligatorios.",
    });
  }

  try {
    const resultado = await usuarioModel.crearConPerfil(
      nombre,
      email,
      biografia,
    );
    return res.status(201).json({
      status: "success",
      message: "Usuario y perfil creados exitosamente en una sola transacción.",
      data: resultado,
    });
  } catch (error) {
    console.error(
      `❌ Error en la transacción (ROLLBACK ejecutado): ${error.message}`,
    );

    // Manejo de email duplicado (código 23505)
    if (error.code === "23505") {
      return res.status(400).json({
        status: "error",
        message: "El email ya se encuentra registrado.",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Error interno al procesar la transacción.",
    });
  }
};
module.exports = {
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  registrarUsuarioConPerfil,
};
