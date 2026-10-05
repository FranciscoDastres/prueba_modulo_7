const { Sequelize } = require("sequelize");
const { connection, schema } = require("./environment.js");

const sequelize = new Sequelize(
  connection.database,
  connection.user,
  connection.password,
  {
    host: connection.host,
    port: connection.port,
    dialect: "postgres",
    logging: false,
    define: { schema, timestamps: false },
    dialectOptions: { statement_timeout: 5000 },
    pool: { max: 5, acquire: 5000 },
  },
);

module.exports = sequelize;
