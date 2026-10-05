const express = require("express");
const pool = require("./config/db.js");
const errores = require("./middleware/errors.js");
const app = express();
app.use(express.json({ limit: "20kb" }));
app.get("/", (req, res) =>
  res.json({
    status: "success",
    message: "ABP Módulo 7: acceso a datos en aplicaciones Node.",
    data: {
      rutas: [
        "/health",
        "/usuarios",
        "/pedidos",
        "/orm/usuarios",
        "/orm/usuarios-pedidos",
      ],
    },
  }),
);
app.get("/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({
    status: "success",
    message: "Servidor y PostgreSQL disponibles.",
    data: { database: "ok" },
  });
});
app.use("/usuarios", require("./routes/usuarios.routes.js"));
app.use("/pedidos", require("./routes/pedidos.routes.js"));
app.use("/orm", require("./routes/orm.routes.js"));
app.use((req, res) =>
  res
    .status(404)
    .json({ status: "error", message: "Ruta no encontrada.", data: null }),
);
app.use(errores);
module.exports = app;
