const modelo = require("../models/usuarios.model.js");
const {
  ApiError,
  entero,
  usuario,
  filtros,
} = require("../utils/validation.js");

const obtenerUsuarios = async (req, res) => {
  const data = await modelo.obtenerTodos(filtros(req.query));
  res.json({
    status: "success",
    message: "Usuarios obtenidos correctamente.",
    data,
  });
};
const obtenerUsuario = async (req, res) => {
  const data = await modelo.obtenerPorId(entero(req.params.id));
  if (!data) throw new ApiError(404, "El usuario no existe.");
  res.json({
    status: "success",
    message: "Usuario obtenido correctamente.",
    data,
  });
};
const actualizarUsuario = async (req, res) => {
  const id = entero(req.params.id);
  const { nombre, email } = usuario(req.body);
  const data = await modelo.actualizar(id, nombre, email);
  if (!data) throw new ApiError(404, "El usuario no existe.");
  res.json({
    status: "success",
    message: "Usuario actualizado correctamente.",
    data,
  });
};
const eliminarUsuario = async (req, res) => {
  const data = await modelo.eliminar(entero(req.params.id));
  if (!data) throw new ApiError(404, "El usuario no existe.");
  res.json({
    status: "success",
    message: "Usuario y registros asociados eliminados correctamente.",
    data,
  });
};
const registrarUsuarioConPerfil = async (req, res) => {
  const { nombre, email, biografia } = usuario(req.body, true);
  const data = await modelo.crearConPerfil(nombre, email, biografia);
  res
    .status(201)
    .json({
      status: "success",
      message: "Usuario y perfil creados en una sola transacción.",
      data,
    });
};
module.exports = {
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  registrarUsuarioConPerfil,
};
