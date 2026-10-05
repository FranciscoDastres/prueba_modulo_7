const router = require("express").Router();
const controller = require("../controllers/pedidos.controller.js");
router.get("/", controller.obtenerPedidos);
router.get("/:id", controller.obtenerPedido);
router.post("/", controller.crearPedido);
router.put("/:id", controller.actualizarPedido);
router.delete("/:id", controller.eliminarPedido);
module.exports = router;
