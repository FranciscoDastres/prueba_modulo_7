const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.js");
module.exports = sequelize.define(
  "Perfil",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    biografia: { type: DataTypes.STRING(1000), allowNull: false },
  },
  { tableName: "perfiles" },
);
