const app = require("./app.js");
const pool = require("./config/db.js");
const sequelize = require("./config/sequelize.js");
async function iniciar() {
  await pool.query("SELECT 1 FROM usuarios LIMIT 1");
  await sequelize.authenticate();
  console.log("✅ Conexión con Sequelize establecida correctamente.");
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT debe estar entre 1 y 65535.");
  const server = app.listen(port, () =>
    console.log(`🚀 Servidor disponible en http://localhost:${port}`),
  );
  server.on("error", async (error) => {
    console.error(`❌ No se pudo iniciar el servidor: ${error.message}`);
    await Promise.all([pool.end(), sequelize.close()]);
    process.exitCode = 1;
  });
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () =>
      server.close(async () => {
        await Promise.all([pool.end(), sequelize.close()]);
      }),
    );
  return server;
}
if (require.main === module)
  iniciar().catch(async (error) => {
    console.error(
      `❌ No se pudo iniciar: ${error.message}. Revisa .env y ejecuta npm run db:init.`,
    );
    await Promise.all([pool.end(), sequelize.close()]);
    process.exitCode = 1;
  });
module.exports = { iniciar };
