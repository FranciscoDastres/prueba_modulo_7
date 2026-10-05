const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { once } = require("node:events");
require("dotenv").config({ quiet: true });

// Cada ejecución usa tablas nuevas. Nunca se borran esquemas de la aplicación.
process.env.DB_SCHEMA = `abp7_test_${process.pid}_${Date.now()}`;
const { schema } = require("../config/environment.js");
const pool = require("../config/db.js");
const sequelize = require("../config/sequelize.js");
const app = require("../app.js");
const report = {
  fecha: new Date().toISOString(),
  esquema: schema,
  pruebas: [],
  operaciones: [],
};
const seed = {
  nombre: "Diego Prueba",
  email: "diego@prueba.cl",
  biografia: "Perfil de prueba transaccional.",
};
let base;

async function request(method, url, body, raw = false) {
  const response = await fetch(`${base}${url}`, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json();
  assert.deepEqual(Object.keys(data).sort(), ["data", "message", "status"]);
  assert.equal(typeof data.message, "string");
  assert.ok(["success", "error"].includes(data.status));
  report.operaciones.push({
    metodo: method,
    ruta: url,
    solicitud:
      body && JSON.stringify(body).length > 4000
        ? {
            resumen: "Solicitud mayor a 20 KB",
            longitudNombre: body.nombre?.length,
          }
        : (body ?? null),
    codigo: response.status,
    respuesta: data,
  });
  return { status: response.status, body: data };
}

test(
  "ABP Módulo 7: verificación HTTP y PostgreSQL real",
  { timeout: 60000 },
  async (t) => {
    let server;
    let schemaCreated = false;
    let usuarioId;
    let pedidoId;
    async function check(nombre, fn) {
      await t.test(nombre, async () => {
        try {
          await fn();
          report.pruebas.push({ nombre, cumple: true });
        } catch (error) {
          report.pruebas.push({ nombre, cumple: false, error: error.message });
          throw error;
        }
      });
    }
    try {
      await pool.query(`CREATE SCHEMA "${schema}"`);
      schemaCreated = true;
      await pool.query(
        await fs.readFile(path.join(__dirname, "../db/schema.sql"), "utf8"),
      );
      await pool.query(
        await fs.readFile(path.join(__dirname, "../db/seed.sql"), "utf8"),
      );
      await sequelize.authenticate();
      server = app.listen(0, "127.0.0.1");
      await once(server, "listening");
      base = `http://127.0.0.1:${server.address().port}`;

      await check(
        "L1: conexión y tablas usuarios, perfiles y pedidos",
        async () => {
          const result = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name",
            [schema],
          );
          assert.deepEqual(
            result.rows.map((row) => row.table_name),
            ["pedidos", "perfiles", "usuarios"],
          );
          assert.equal((await request("GET", "/health")).status, 200);
        },
      );
      await check(
        "L1/L2: tres usuarios simulados y seed repetible",
        async () => {
          await pool.query(
            await fs.readFile(path.join(__dirname, "../db/seed.sql"), "utf8"),
          );
          const result = await pool.query(
            "SELECT (SELECT COUNT(*) FROM usuarios)::int AS usuarios, (SELECT COUNT(*) FROM perfiles)::int AS perfiles, (SELECT COUNT(*) FROM pedidos)::int AS pedidos",
          );
          assert.deepEqual(result.rows[0], {
            usuarios: 3,
            perfiles: 3,
            pedidos: 3,
          });
        },
      );
      await check(
        "L2: GET /usuarios sin credenciales ni datos de autenticación",
        async () => {
          const result = await request("GET", "/usuarios");
          assert.equal(result.status, 200);
          assert.equal(result.body.data.length, 3);
          for (const user of result.body.data)
            assert.deepEqual(Object.keys(user).sort(), [
              "created_at",
              "email",
              "id",
              "nombre",
            ]);
        },
      );
      await check("L2 PLUS: filtro por nombre y paginación", async () => {
        const filtered = await request("GET", "/usuarios?nombre=ana");
        assert.equal(filtered.status, 200);
        assert.equal(filtered.body.data.length, 1);
        assert.equal(filtered.body.data[0].email, "ana@ejemplo.cl");
        const first = await request("GET", "/usuarios?pagina=1&limite=1");
        const second = await request("GET", "/usuarios?pagina=2&limite=1");
        assert.equal(first.body.data.length, 1);
        assert.equal(second.body.data.length, 1);
        assert.notEqual(first.body.data[0].id, second.body.data[0].id);
      });
      await check(
        "L2: búsquedas parametrizadas ante caracteres SQL",
        async () => {
          const result = await request(
            "GET",
            `/usuarios?nombre=${encodeURIComponent("' OR 1=1 --")}`,
          );
          assert.equal(result.status, 200);
          assert.deepEqual(result.body.data, []);
        },
      );
      await check(
        "L4: POST /usuarios confirma usuario y perfil juntos",
        async () => {
          const result = await request("POST", "/usuarios", seed);
          assert.equal(result.status, 201);
          usuarioId = result.body.data.usuario.id;
          const profile = await pool.query(
            "SELECT usuario_id, biografia FROM perfiles WHERE usuario_id=$1",
            [usuarioId],
          );
          assert.equal(profile.rows[0].usuario_id, usuarioId);
          assert.equal(profile.rows[0].biografia, seed.biografia);
        },
      );
      await check("L2: consulta de usuario por ID", async () => {
        const result = await request("GET", `/usuarios/${usuarioId}`);
        assert.equal(result.status, 200);
        assert.equal(result.body.data.email, seed.email);
      });
      await check("L3: PUT actualiza y persiste nombre/email", async () => {
        const result = await request("PUT", `/usuarios/${usuarioId}`, {
          nombre: "Diego Actualizado",
          email: "DIEGO@PRUEBA.CL",
        });
        assert.equal(result.status, 200);
        const read = await request("GET", `/usuarios/${usuarioId}`);
        assert.equal(read.body.data.nombre, "Diego Actualizado");
        assert.equal(read.body.data.email, seed.email);
      });
      await check(
        "L3: email duplicado devuelve 409 y conserva los datos",
        async () => {
          assert.equal(
            (
              await request("PUT", `/usuarios/${usuarioId}`, {
                nombre: "No debe persistir",
                email: "ana@ejemplo.cl",
              })
            ).status,
            409,
          );
          assert.equal(
            (await request("GET", `/usuarios/${usuarioId}`)).body.data.nombre,
            "Diego Actualizado",
          );
          assert.equal(
            (
              await request("POST", "/usuarios", {
                ...seed,
                email: "ana@ejemplo.cl",
              })
            ).status,
            409,
          );
        },
      );
      for (const id of ["abc", "1.5", "0", "-1", "2147483648"]) {
        await check(`L3: rechaza ID inválido ${id}`, async () => {
          assert.equal(
            (await request("PUT", `/usuarios/${id}`, seed)).status,
            400,
          );
          assert.equal(
            (await request("DELETE", `/usuarios/${id}`)).status,
            400,
          );
        });
      }
      await check("L3: IDs inexistentes devuelven 404", async () => {
        for (const method of ["GET", "PUT", "DELETE"])
          assert.equal(
            (
              await request(
                method,
                "/usuarios/2147483647",
                method === "PUT" ? seed : undefined,
              )
            ).status,
            404,
          );
      });
      for (const [name, body] of [
        ["campos ausentes", {}],
        ["nombre vacío", { ...seed, nombre: "   " }],
        ["email inválido", { ...seed, email: "incorrecto" }],
        ["biografía inválida", { ...seed, biografia: [] }],
      ])
        await check(`Validaciones: ${name}`, async () =>
          assert.equal((await request("POST", "/usuarios", body)).status, 400),
        );
      await check(
        "Validaciones: JSON mal formado y paginación inválida",
        async () => {
          assert.equal(
            (await request("POST", "/usuarios", "{", true)).status,
            400,
          );
          assert.equal(
            (
              await request("POST", "/usuarios", {
                ...seed,
                nombre: "a".repeat(21000),
              })
            ).status,
            413,
          );
          assert.equal(
            (await request("GET", "/usuarios?limite=101")).status,
            400,
          );
          assert.equal(
            (await request("GET", "/orm/usuarios?pagina=0")).status,
            400,
          );
        },
      );
      await check(
        "L4: error en la segunda inserción revierte también el usuario",
        async () => {
          // El trigger vive solo en el esquema de prueba y falla después del INSERT de usuario.
          await pool.query(
            `CREATE FUNCTION "${schema}".forzar_error_perfil() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Fallo controlado para demostrar rollback'; END; $$`,
          );
          await pool.query(
            `CREATE TRIGGER fallo_perfil BEFORE INSERT ON perfiles FOR EACH ROW EXECUTE FUNCTION "${schema}".forzar_error_perfil()`,
          );
          try {
            const result = await request("POST", "/usuarios", {
              ...seed,
              email: "rollback@prueba.cl",
            });
            assert.equal(result.status, 500);
            const persisted = await pool.query(
              "SELECT COUNT(*)::int AS cantidad FROM usuarios WHERE email=$1",
              ["rollback@prueba.cl"],
            );
            assert.equal(persisted.rows[0].cantidad, 0);
            const orphan = await pool.query(
              "SELECT COUNT(*)::int AS cantidad FROM perfiles p LEFT JOIN usuarios u ON u.id=p.usuario_id WHERE u.id IS NULL",
            );
            assert.equal(orphan.rows[0].cantidad, 0);
            report.rollback = {
              errorHTTP: result.status,
              usuariosPersistidos: 0,
              perfilesHuerfanos: 0,
            };
          } finally {
            await pool.query("DROP TRIGGER fallo_perfil ON perfiles");
          }
        },
      );
      await check(
        "L5: SQL manual y ORM producen resultados idénticos",
        async () => {
          const sql = await request("GET", "/usuarios");
          const orm = await request("GET", "/orm/usuarios");
          assert.equal(orm.status, 200);
          assert.deepEqual(orm.body.data, sql.body.data);
          report.comparacion = {
            usuariosSQL: sql.body.data.length,
            usuariosORM: orm.body.data.length,
            identicos: true,
          };
        },
      );
      await check("L6: include devuelve pedidos 1:N y perfil 1:1", async () => {
        const result = await request("GET", "/orm/usuarios-pedidos");
        assert.equal(result.status, 200);
        const ana = result.body.data.find(
          (user) => user.email === "ana@ejemplo.cl",
        );
        assert.equal(ana.pedidos.length, 2);
        assert.equal(ana.perfil.usuario_id, ana.id);
        assert.ok(ana.pedidos.every((order) => order.usuario_id === ana.id));
      });
      await check(
        "L6: clave foránea de pedidos referencia usuarios e incluye índice",
        async () => {
          const result = await pool.query(
            "SELECT c.confrelid::regclass::text AS tabla FROM pg_constraint c WHERE c.conrelid=($1 || '.pedidos')::regclass AND c.contype='f'",
            [schema],
          );
          assert.ok(result.rows[0].tabla.endsWith("usuarios"));
          const indexes = await pool.query(
            "SELECT indexdef FROM pg_indexes WHERE schemaname=$1 AND tablename='pedidos'",
            [schema],
          );
          assert.ok(
            indexes.rows.some((row) => row.indexdef.includes("(usuario_id)")),
          );
        },
      );
      await check("CRUD pedidos: crear y consultar", async () => {
        const created = await request("POST", "/pedidos", {
          usuario_id: usuarioId,
          monto: "4500.50",
        });
        assert.equal(created.status, 201);
        pedidoId = created.body.data.id;
        const read = await request("GET", `/pedidos/${pedidoId}`);
        assert.equal(read.status, 200);
        assert.equal(read.body.data.monto, "4500.50");
        const filtered = await request(
          "GET",
          `/pedidos?usuario_id=${usuarioId}`,
        );
        assert.equal(filtered.body.data.length, 1);
      });
      await check("CRUD pedidos: actualizar y eliminar", async () => {
        assert.equal(
          (
            await request("PUT", `/pedidos/${pedidoId}`, {
              usuario_id: usuarioId,
              monto: 9999,
            })
          ).status,
          200,
        );
        assert.equal(
          (await request("GET", `/pedidos/${pedidoId}`)).body.data.monto,
          "9999.00",
        );
        assert.equal(
          (await request("DELETE", `/pedidos/${pedidoId}`)).status,
          200,
        );
        assert.equal(
          (await request("GET", `/pedidos/${pedidoId}`)).status,
          404,
        );
      });
      await check("Pedidos: monto y usuario asociado válidos", async () => {
        for (const monto of [-1, 0, "1.234", null])
          assert.equal(
            (
              await request("POST", "/pedidos", {
                usuario_id: usuarioId,
                monto,
              })
            ).status,
            400,
          );
        assert.equal(
          (
            await request("POST", "/pedidos", {
              usuario_id: [usuarioId],
              monto: 100,
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await request("POST", "/pedidos", {
              usuario_id: 2147483647,
              monto: 100,
            })
          ).status,
          404,
        );
        assert.equal(
          (await request("DELETE", "/pedidos/2147483647")).status,
          404,
        );
      });
      await check(
        "L3: DELETE elimina usuario y relaciones en cascada",
        async () => {
          await request("POST", "/pedidos", {
            usuario_id: usuarioId,
            monto: 100,
          });
          assert.equal(
            (await request("DELETE", `/usuarios/${usuarioId}`)).status,
            200,
          );
          assert.equal(
            (await request("GET", `/usuarios/${usuarioId}`)).status,
            404,
          );
          const result = await pool.query(
            "SELECT (SELECT COUNT(*) FROM perfiles WHERE usuario_id=$1)::int AS perfiles, (SELECT COUNT(*) FROM pedidos WHERE usuario_id=$1)::int AS pedidos",
            [usuarioId],
          );
          assert.deepEqual(result.rows[0], { perfiles: 0, pedidos: 0 });
        },
      );
      await check(
        "L2: errores reales de consulta devuelven 500 controlado",
        async () => {
          await pool.query(
            "ALTER TABLE usuarios RENAME TO usuarios_error_controlado",
          );
          try {
            const result = await request("GET", "/usuarios");
            assert.equal(result.status, 500);
            assert.equal(result.body.message, "Error interno del servidor.");
          } finally {
            await pool.query(
              "ALTER TABLE usuarios_error_controlado RENAME TO usuarios",
            );
          }
        },
      );
      await check(
        "Módulo 8 excluido: login, registro, subida y uploads devuelven 404",
        async () => {
          for (const url of [
            "/api/auth/login",
            "/api/auth/registro",
            "/api/auth/subir-imagen",
          ])
            assert.equal((await request("POST", url, {})).status, 404);
          assert.equal(
            (await request("GET", "/uploads/prueba.png")).status,
            404,
          );
        },
      );
    } finally {
      if (server) await new Promise((resolve) => server.close(resolve));
      await sequelize.close();
      if (schemaCreated && /^abp7_test_\d+_\d+$/.test(schema))
        await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
      await pool.end();
      report.total = report.pruebas.length;
      report.aprobadas = report.pruebas.filter((item) => item.cumple).length;
      report.esquemaPruebasEliminado = schemaCreated;
      const directory = path.join(__dirname, "../output/evidencias");
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(
        path.join(directory, "verificacion.json"),
        JSON.stringify(report, null, 2) + "\n",
      );
    }
  },
);
