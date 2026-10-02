const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png/;
  const mimeTypeValido = tiposPermitidos.test(file.mimetype);
  const extValida = tiposPermitidos.test(
    path.extname(file.originalname).toLowerCase(),
  );

  if (mimeTypeValido && extValida) {
    return cb(null, true);
  }
  cb(
    new Error(
      "Formato no permitido. Solo se aceptan imágenes JPG, JPEG y PNG.",
    ),
  );
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB límite
  fileFilter: fileFilter,
});

module.exports = upload;
