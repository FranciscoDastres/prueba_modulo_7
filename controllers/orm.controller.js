const { Op } = require("sequelize");
const { Usuario, Pedido, Perfil } = require("../models/orm/index.js");
const { filtros } = require("../utils/validation.js");
function opciones(query) {
  const { nombre, pagina, limite } = filtros(query);
  return {
    where: nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : {},
    order: [["id", "ASC"]],
    limit: limite,
    offset: (pagina - 1) * limite,
  };
}
const obtenerUsuariosORM = async (req, res) => {
  const data = await Usuario.findAll(opciones(req.query));
  res.json({
    status: "success",
    message: "Usuarios obtenidos con Sequelize ORM.",
    data,
  });
};
const obtenerUsuariosConPedidos = async (req, res) => {
  const data = await Usuario.findAll({
    ...opciones(req.query),
    include: [
      { model: Pedido, as: "pedidos" },
      { model: Perfil, as: "perfil" },
    ],
  });
  res.json({
    status: "success",
    message: "Usuarios con pedidos (1:N) y perfil (1:1).",
    data,
  });
};
module.exports = { obtenerUsuariosORM, obtenerUsuariosConPedidos };
