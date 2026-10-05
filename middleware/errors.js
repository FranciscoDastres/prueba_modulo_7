const { ApiError } = require("../utils/validation.js");
module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  let status = 500;
  let message = "Error interno del servidor.";
  const code = error.code || error.original?.code;
  if (error instanceof ApiError) {
    status = error.status;
    message = error.message;
  } else if (error.type === "entity.parse.failed") {
    status = 400;
    message = "El cuerpo debe contener JSON válido.";
  } else if (error.type === "entity.too.large") {
    status = 413;
    message = "El cuerpo de la solicitud supera el límite de 20 KB.";
  } else if (code === "23505") {
    status = 409;
    message = "El email ya está registrado.";
  } else if (code === "23503") {
    status = 409;
    message = "El usuario asociado no existe.";
  } else if (["23502", "23514", "22001"].includes(code)) {
    status = 400;
    message = "Los datos no cumplen las restricciones de la base de datos.";
  }
  if (status === 500)
    console.error(`❌ ${req.method} ${req.path}: ${error.message}`);
  return res.status(status).json({ status: "error", message, data: null });
};
