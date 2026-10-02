const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.js");

const Pedido = sequelize.define(
  "Pedido",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "pedidos",
    timestamps: false,
  },
);

module.exports = Pedido;
