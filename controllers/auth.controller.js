const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/auth.model.js");

const registrar = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Todos los campos son obligatorios." });
  }

  try {
    const usuarioExistente = await authModel.buscarPorEmail(email);
    if (usuarioExistente) {
      return res
        .status(400)
        .json({ status: "error", message: "El email ya está registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await authModel.registrarUsuario(
      nombre,
      email,
      passwordHash,
    );

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado con éxito.",
      data: nuevoUsuario,
    });
  } catch (error) {
    console.error(`Error en registro: ${error.message}`);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Error interno del servidor al registrar usuario.",
      });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "Email y contraseña son obligatorios.",
      });
  }

  try {
    const usuario = await authModel.buscarPorEmail(email);
    if (!usuario) {
      return res
        .status(401)
        .json({ status: "error", message: "Credenciales inválidas." });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res
        .status(401)
        .json({ status: "error", message: "Credenciales inválidas." });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    return res.status(200).json({
      status: "success",
      message: "Autenticación exitosa.",
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          imagen: usuario.imagen,
        },
      },
    });
  } catch (error) {
    console.error(`Error en login: ${error.message}`);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Error interno del servidor al autenticar.",
      });
  }
};

const subirImagen = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "No se proporcionó ningún archivo de imagen.",
      });
  }

  try {
    const usuarioId = req.usuario.id; // Extraído desde el token por el middleware auth
    const nombreArchivo = req.file.filename;

    const usuarioActualizado = await authModel.actualizarImagen(
      usuarioId,
      nombreArchivo,
    );

    return res.status(200).json({
      status: "success",
      message: "Imagen de perfil actualizada correctamente.",
      data: {
        archivo: nombreArchivo,
        path: `/uploads/${nombreArchivo}`,
        usuario: usuarioActualizado,
      },
    });
  } catch (error) {
    console.error(`Error en subirImagen: ${error.message}`);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Error interno del servidor al actualizar la imagen.",
      });
  }
};

module.exports = {
  registrar,
  login,
  subirImagen,
};
