const { Usuario, Pedido } = require("../models/orm/index.js");

// Consulta utilizando ORM sin relaciones
const obtenerUsuariosORM = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    return res.status(200).json({
      status: "success",
      message: "Usuarios obtenidos con Sequelize ORM",
      data: usuarios,
    });
  } catch (error) {
    console.error(`Error ORM: ${error.message}`);
    return res
      .status(500)
      .json({ status: "error", message: "Error en consulta ORM" });
  }
};

// Consulta utilizando ORM con Relaciones (include)
const obtenerUsuariosConPedidos = async (req, res) => {
  try {
    const usuariosConPedidos = await Usuario.findAll({
      include: [
        {
          model: Pedido,
          as: "pedidos",
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      message: "Usuarios y sus pedidos asociados (Relación 1:N)",
      data: usuariosConPedidos,
    });
  } catch (error) {
    console.error(`Error ORM Relaciones: ${error.message}`);
    return res
      .status(500)
      .json({ status: "error", message: "Error al consultar relaciones" });
  }
};

module.exports = {
  obtenerUsuariosORM,
  obtenerUsuariosConPedidos,
};
