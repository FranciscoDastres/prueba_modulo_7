const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Acceso denegado: Token no proporcionado.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Guardamos los datos del token en la request
    next();
  } catch (error) {
    return res.status(403).json({
      status: "error",
      message: "Token inválido o expirado.",
    });
  }
};

module.exports = {
  verificarToken,
};
