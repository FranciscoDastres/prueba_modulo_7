const Usuario = require("./Usuario.js");
const Pedido = require("./Pedido.js");
const Perfil = require("./Perfil.js");

// Relaciones coherentes con las claves foráneas de db/schema.sql.
Usuario.hasMany(Pedido, {
  foreignKey: "usuario_id",
  as: "pedidos",
  onDelete: "CASCADE",
});
Pedido.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });
Usuario.hasOne(Perfil, {
  foreignKey: "usuario_id",
  as: "perfil",
  onDelete: "CASCADE",
});
Perfil.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

module.exports = {
  Usuario,
  Pedido,
  Perfil,
};
