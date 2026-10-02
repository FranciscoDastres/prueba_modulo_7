const express = require("express");
const router = express.Router();
const ormController = require("../controllers/orm.controller.js");

router.get("/usuarios", ormController.obtenerUsuariosORM);
router.get("/usuarios-pedidos", ormController.obtenerUsuariosConPedidos);

module.exports = router;
