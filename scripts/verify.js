const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const directory = path.join(__dirname, "../output/evidencias");
fs.mkdirSync(directory, { recursive: true });
const result = spawnSync(
  process.execPath,
  ["--test", "tests/modulo7.test.js"],
  { cwd: path.join(__dirname, ".."), encoding: "utf8", timeout: 90000 },
);
const log = (result.stdout || "") + (result.stderr || "");
fs.writeFileSync(path.join(directory, "pruebas.txt"), log);
process.stdout.write(log);
if (result.status !== 0) {
  process.exitCode = 1;
  return;
}
const report = JSON.parse(
  fs.readFileSync(path.join(directory, "verificacion.json"), "utf8"),
);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const checks = report.pruebas
  .map((item) => `<li><span class="check">✓</span>${escape(item.nombre)}</li>`)
  .join("");
const operations = report.operaciones
  .map(
    (item, i) =>
      `<article id="operacion-${i + 1}"><h3>${escape(item.metodo)} ${escape(item.ruta)} <span class="code">HTTP ${item.codigo}</span></h3>${item.solicitud === null ? "" : `<h4>Solicitud</h4><pre>${escape(JSON.stringify(item.solicitud, null, 2))}</pre>`}<h4>Respuesta</h4><pre>${escape(JSON.stringify(item.respuesta, null, 2))}</pre></article>`,
  )
  .join("");
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Evidencias ABP Módulo 7</title><style>body{font:16px/1.5 system-ui,sans-serif;background:#f4f6f8;color:#152238;margin:0}main{max-width:1050px;margin:32px auto;padding:0 24px}header,section,article{background:white;border:1px solid #d8dfe7;border-radius:8px;padding:24px;margin:20px 0}h1{margin:0 0 12px;font-size:30px}h2{font-size:24px}h3{font-size:19px;margin:0 0 16px}h4{margin:16px 0 8px}ul{list-style:none;padding:0}li{padding:9px 0;border-bottom:1px solid #e8ecf0}.check{color:#166534;font-weight:bold;margin-right:12px}.badge{display:inline-block;background:#dcfce7;color:#166534;padding:8px 16px;border-radius:6px;font-weight:bold}.code{float:right;color:#334155}pre{font:13px/1.5 ui-monospace,monospace;background:#f1f5f9;padding:16px;white-space:pre-wrap;overflow-wrap:anywhere}p{margin:8px 0}.note{color:#475569}@media print{body{background:white}main{margin:0}article{break-inside:avoid}.code{float:none}}</style></head><body><main><header><h1>ABP · Módulo 7</h1><p>Acceso a datos en aplicaciones Node</p><p class="badge">${report.aprobadas}/${report.total} verificaciones aprobadas</p><p>Fecha de ejecución: ${escape(report.fecha)}</p><p class="note">Pruebas HTTP contra PostgreSQL real en un esquema temporal independiente, eliminado al finalizar.</p></header><section id="resumen"><h2>Checks de la entrega</h2><ul>${checks}</ul></section><section id="rollback"><h2>Transaccionalidad comprobada</h2><p>Se forzó un error al insertar el perfil, después de insertar el usuario. El endpoint respondió HTTP 500 y PostgreSQL confirmó <strong>0 usuarios persistidos y 0 perfiles huérfanos</strong>.</p><pre>${escape(JSON.stringify(report.rollback, null, 2))}</pre><h2>Comparación SQL / ORM</h2><pre>${escape(JSON.stringify(report.comparacion, null, 2))}</pre></section><h2>Peticiones y respuestas reales</h2>${operations}</main></body></html>`;
fs.writeFileSync(path.join(directory, "verificacion.html"), html);
console.log("✅ Evidencias generadas en output/evidencias/verificacion.html");
