const Usuario = require("./Usuario.js");
const Pedido = require("./Pedido.js");

// Definición de relación 1:N (Un usuario/cliente tiene muchos pedidos)
Usuario.hasMany(Pedido, { foreignKey: "cliente_id", as: "pedidos" });
Pedido.belongsTo(Usuario, { foreignKey: "cliente_id", as: "usuario" });

module.exports = {
  Usuario,
  Pedido,
};
