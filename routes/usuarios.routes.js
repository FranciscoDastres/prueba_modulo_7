const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarios.controller.js");

router.get("/", usuariosController.obtenerUsuarios);
router.post("/", usuariosController.registrarUsuarioConPerfil);
router.put("/:id", usuariosController.actualizarUsuario);
router.delete("/:id", usuariosController.eliminarUsuario);

module.exports = router;
