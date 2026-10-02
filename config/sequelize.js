const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false, // Desactiva los logs de SQL en consola para mantenerla limpia
  },
);

const probarConexion = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión con Sequelize establecida correctamente.");
  } catch (error) {
    console.error("❌ Error al conectar con Sequelize:", error.message);
  }
};

probarConexion();

module.exports = sequelize;
