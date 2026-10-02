require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");

const usuariosRouter = require("./routes/usuarios.routes.js");
const ormRouter = require("./routes/orm.routes.js");
const authRouter = require("./routes/auth.routes.js"); // 1. Rutas Auth

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir la carpeta de imágenes subidas
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Modulos
app.use("/usuarios", usuariosRouter);
app.use("/orm", ormRouter);
app.use("/api/auth", authRouter); // 2. Endpoint base para Auth

// Manejo de errores global de Multer (formatos/tamaño de archivo)
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
