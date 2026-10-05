const { Pedido, Usuario } = require("../models/orm/index.js");
const { ApiError, entero, pedido } = require("../utils/validation.js");
const obtenerPedidos = async (req, res) => {
  const where =
    req.query.usuario_id === undefined
      ? {}
      : { usuario_id: entero(req.query.usuario_id, "usuario_id") };
  const data = await Pedido.findAll({ where, order: [["id", "ASC"]] });
  res.json({
    status: "success",
    message: "Pedidos obtenidos correctamente.",
    data,
  });
};
const obtenerPedido = async (req, res) => {
  const data = await Pedido.findByPk(entero(req.params.id));
  if (!data) throw new ApiError(404, "El pedido no existe.");
  res.json({
    status: "success",
    message: "Pedido obtenido correctamente.",
    data,
  });
};
async function validarUsuario(id) {
  if (!(await Usuario.findByPk(id)))
    throw new ApiError(404, "El usuario asociado no existe.");
}
const crearPedido = async (req, res) => {
  const datos = pedido(req.body);
  await validarUsuario(datos.usuario_id);
  const data = await Pedido.create(datos);
  res
    .status(201)
    .json({ status: "success", message: "Pedido creado correctamente.", data });
};
const actualizarPedido = async (req, res) => {
  const id = entero(req.params.id);
  const datos = pedido(req.body);
  const data = await Pedido.findByPk(id);
  if (!data) throw new ApiError(404, "El pedido no existe.");
  await validarUsuario(datos.usuario_id);
  await data.update(datos);
  res.json({
    status: "success",
    message: "Pedido actualizado correctamente.",
    data,
  });
};
const eliminarPedido = async (req, res) => {
  const data = await Pedido.findByPk(entero(req.params.id));
  if (!data) throw new ApiError(404, "El pedido no existe.");
  await data.destroy();
  res.json({
    status: "success",
    message: "Pedido eliminado correctamente.",
    data,
  });
};
module.exports = {
  obtenerPedidos,
  obtenerPedido,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
};
