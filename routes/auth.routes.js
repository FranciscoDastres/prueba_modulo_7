const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");
const { verificarToken } = require("../middlewares/auth.middleware.js");
const upload = require("../middlewares/upload.middleware.js");

// Rutas Públicas
router.post("/registro", authController.registrar);
router.post("/login", authController.login);

// Ruta Privada (Protegida con JWT y Middleware de Multer)
router.post(
  "/subir-imagen",
  verificarToken,
  upload.single("imagen"),
  authController.subirImagen,
);

module.exports = router;
