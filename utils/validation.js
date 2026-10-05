class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
function entero(value, nombre = "ID", max = 2147483647) {
  if (
    !["string", "number"].includes(typeof value) ||
    !/^[1-9]\d*$/.test(String(value)) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) > max
  )
    throw new ApiError(400, `${nombre} debe ser un entero positivo válido.`);
  return Number(value);
}
function texto(value, nombre, max) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new ApiError(
      400,
      `${nombre} es obligatorio y admite hasta ${max} caracteres.`,
    );
  return value.trim();
}
function usuario(body, conPerfil = false) {
  const nombre = texto(body?.nombre, "nombre", 100);
  const email = texto(body?.email, "email", 100).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ApiError(400, "El email debe tener un formato válido.");
  const datos = { nombre, email };
  if (conPerfil) datos.biografia = texto(body?.biografia, "biografia", 1000);
  return datos;
}
function pedido(body) {
  const usuario_id = entero(body?.usuario_id, "usuario_id");
  const valor = body?.monto;
  if (
    !["string", "number"].includes(typeof valor) ||
    !/^\d+(\.\d{1,2})?$/.test(String(valor)) ||
    Number(valor) <= 0 ||
    Number(valor) > 99999999.99
  )
    throw new ApiError(
      400,
      "monto debe ser positivo, con hasta dos decimales y un máximo de 99999999.99.",
    );
  return { usuario_id, monto: String(valor) };
}
function filtros(query) {
  const nombre =
    query.nombre === undefined ? undefined : texto(query.nombre, "nombre", 100);
  const pagina =
    query.pagina === undefined ? 1 : entero(query.pagina, "pagina", 1000000);
  const limite =
    query.limite === undefined ? 100 : entero(query.limite, "limite", 100);
  return { nombre, pagina, limite };
}
module.exports = { ApiError, entero, usuario, pedido, filtros };
