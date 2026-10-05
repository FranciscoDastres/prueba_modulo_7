# ABP Módulo 7: acceso a datos en aplicaciones Node

Entrega de la **Parte 2**, según las lecciones 1 a 6 del PDF de `abp/` (páginas impresas 11 a 15). El proyecto usa Node.js, Express, PostgreSQL, `pg` y Sequelize para consultar y modificar datos, ejecutar transacciones y relacionar modelos.

## Requisitos e instalación

- Node.js **18.20 o superior** y npm.
- PostgreSQL disponible y un usuario con permiso para crear un esquema dentro de su base de datos.

```bash
npm ci
cp .env.example .env
```

Si ya tienes `.env`, conserva ese archivo. Configura localmente `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_DATABASE`. Las credenciales reales quedan fuera de Git; `.env.example` contiene valores de ejemplo.

La base de datos indicada en `DB_DATABASE` debe existir. Si necesitas una nueva, puedes crearla con PostgreSQL:

```bash
psql -h localhost -U postgres -c 'CREATE DATABASE modulo_7;'
```

Inicializa las tablas y los datos simulados, y luego inicia el servidor:

```bash
npm run db:init
npm start
```

El servidor queda disponible en `http://localhost:3000`, salvo que cambies `PORT`. `npm run dev` usa la recarga automática de Node (`node --watch`). Al iniciar se comprueban las conexiones SQL y ORM; un error impide anunciar un arranque exitoso.

### Esquema de esta entrega

`DB_SCHEMA=modulo7` separa las tablas de esta entrega de las tablas anteriores en `public`. El inicializador crea `usuarios`, `perfiles` y `pedidos`, con **3 usuarios, 3 perfiles y 3 pedidos simulados**. Ejecutar de nuevo el inicializador sin modificar esos datos no los duplica.

Las columnas de usuarios son `id`, `nombre`, `email` y `created_at`. Cada pedido usa `usuario_id`, una clave foránea que referencia realmente a `usuarios.id`. El script no altera los datos de las tablas anteriores en `public`.

## Rutas

Todas las respuestas usan `{ status, message, data }`, incluidos los errores.

| Método | Ruta                    | Función                                                  |
| ------ | ----------------------- | -------------------------------------------------------- |
| GET    | `/`                     | Información de la aplicación y rutas disponibles         |
| GET    | `/health`               | Comprueba disponibilidad de PostgreSQL                   |
| GET    | `/usuarios`             | Lista usuarios usando SQL parametrizado                  |
| GET    | `/usuarios/:id`         | Obtiene un usuario                                       |
| POST   | `/usuarios`             | Crea usuario y perfil en una sola transacción            |
| PUT    | `/usuarios/:id`         | Actualiza nombre y email                                 |
| DELETE | `/usuarios/:id`         | Elimina usuario y sus registros asociados                |
| GET    | `/pedidos`              | Lista pedidos con Sequelize; admite `?usuario_id=1`      |
| GET    | `/pedidos/:id`          | Obtiene un pedido                                        |
| POST   | `/pedidos`              | Crea un pedido para un usuario existente                 |
| PUT    | `/pedidos/:id`          | Modifica el usuario asociado y el monto                  |
| DELETE | `/pedidos/:id`          | Elimina un pedido                                        |
| GET    | `/orm/usuarios`         | Lista usuarios usando Sequelize                          |
| GET    | `/orm/usuarios-pedidos` | Obtiene usuarios con pedidos y perfil mediante `include` |

Las tres consultas de usuarios admiten `?nombre=Ana`, `?pagina=1` y `?limite=2`. El límite predeterminado es 100 y el máximo permitido es 100.

Crear usuario y perfil:

```bash
curl -X POST http://localhost:3000/usuarios \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Diego Prueba","email":"diego@prueba.cl","biografia":"Perfil de demostración"}'
```

Actualizar el usuario, reemplazando `4` por el ID recibido:

```bash
curl -X PUT http://localhost:3000/usuarios/4 \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Diego Actualizado","email":"diego@prueba.cl"}'
```

Crear un pedido para ese usuario:

```bash
curl -X POST http://localhost:3000/pedidos \
  -H 'Content-Type: application/json' \
  -d '{"usuario_id":4,"monto":"4500.50"}'
```

Los códigos son: `200` consulta/modificación/eliminación, `201` creación, `400` datos inválidos, `404` registro o ruta inexistente, `409` duplicado o conflicto de referencia, `413` JSON que supera 20 KB y `500` fallo interno controlado.

## Checks de las seis lecciones

- [x] **Lección 1:** PostgreSQL conectado con `pg.Pool` y Sequelize, credenciales en `.env`, tablas creadas y mensajes de conexión.
- [x] **Lección 2:** `GET /usuarios`, 3 registros simulados, selección explícita de columnas, respuestas JSON y manejo de errores reales de consulta.
- [x] **Lección 3:** `PUT` y `DELETE`, validación de ID y existencia, persistencia de cambios y confirmación de éxito.
- [x] **Lección 4:** dos inserciones dentro de `BEGIN`/`COMMIT`, `ROLLBACK` ante un fallo y evidencia de reversión de la primera inserción.
- [x] **Lección 5:** modelo Usuario, consulta mediante ORM y comparación automática de sus resultados con SQL manual.
- [x] **Lección 6:** Usuario/Pedido relacionados 1:N, Usuario/Perfil relacionados 1:1 y consulta anidada con `include`.
- [x] CRUD completo sobre dos entidades: usuarios y pedidos.
- [x] Filtrado y paginación de usuarios, como PLUS de la lección 2.
- [x] Modelos, controladores, rutas y middleware de errores separados.

## Verificación y evidencias

```bash
npm test
npm run verify
```

Las pruebas usan **HTTP real y PostgreSQL real** en un esquema temporal propio. Crean y eliminan exclusivamente datos de prueba. Ese esquema se elimina al terminar; el esquema de la aplicación se conserva.

`npm run verify` también genera:

- [Informe visual con checks y peticiones/respuestas](output/evidencias/verificacion.html).
- [Resultados y evidencias en JSON](output/evidencias/verificacion.json).
- [Salida de las pruebas, incluidos los logs de COMMIT y ROLLBACK](output/evidencias/pruebas.txt).
- [Ejecución de la colección de Postman: 17 peticiones y 34 verificaciones](output/evidencias/postman.json).
- [Auditoría de dependencias](output/evidencias/auditoria-dependencias.json).
- [Capturas de la verificación](output/playwright/).

La prueba de rollback instala un trigger **solo en el esquema de pruebas**: falla la inserción del perfil después de insertar el usuario. Comprueba HTTP 500, cero usuarios persistidos con ese email y cero perfiles huérfanos. El trigger y el esquema temporal se eliminan. Los mensajes de error de ese caso y del fallo SQL deliberado son parte de la evidencia esperada.

La [colección de Postman](docs/modulo7.postman_collection.json) permite repetir las operaciones principales. Su variable `base_url` vale `http://localhost:3000`; captura automáticamente los IDs creados. Ejecútala en el orden de la colección con el servidor iniciado.

## Decisiones técnicas

- **Cliente `pg`:** permite estudiar SQL explícito y transacciones usando un mismo cliente reservado del pool. Las consultas parametrizadas separan los valores del SQL.
- **Datos sensibles:** `.env` está ignorado por Git y no se incluye en el paquete de entrega. Las consultas devuelven solo los campos del modelo de este módulo.
- **Campos actualizables:** el usuario modifica nombre y email; su ID y fecha de creación los controla PostgreSQL. El email se normaliza a minúsculas y su restricción `UNIQUE` evita duplicados, incluso ante solicitudes concurrentes.
- **Validaciones:** IDs enteros positivos dentro del rango de PostgreSQL, textos no vacíos con límites de longitud, email válido, montos positivos con hasta dos decimales y existencia del usuario asociado. Las claves foráneas y restricciones refuerzan la validación en PostgreSQL.
- **Transacciones:** usuario y perfil forman una unidad; guardar solo uno dejaría datos incompletos. `finally` libera el cliente del pool tanto en éxito como en error.
- **ORM:** Sequelize facilita consultas y relaciones con `include`; `pg` permite comparar el SQL manual con la misma información. Los tests comparan ambos resultados completos, incluidas sus fechas.
- **Relaciones:** `perfiles.usuario_id` es único para la relación 1:1; `pedidos.usuario_id` permite múltiples pedidos. `ON DELETE CASCADE` elimina los registros asociados al eliminar el usuario. La clave foránea de pedidos tiene un índice.
- **Dependencias:** `uuid` se fija mediante un override de Sequelize a una versión corregida compatible con sus llamadas `v1`/`v4`. La recarga de desarrollo usa Node, sin una dependencia adicional.

## Estructura

```text
app.js                       # Express, rutas y errores
server.js                    # Verificación de conexiones y arranque
config/                      # Entorno, pg.Pool y Sequelize
controllers/                 # Usuarios, pedidos y consultas ORM
middleware/errors.js         # Respuestas de error consistentes
models/usuarios.model.js     # SQL manual y transacción usuario/perfil
models/orm/                  # Usuario, Perfil, Pedido y asociaciones
routes/                      # Rutas de las dos entidades y consultas ORM
utils/validation.js          # Validación de entrada
db/schema.sql                # Tablas, restricciones e índice
db/seed.sql                  # Datos simulados
scripts/                     # Inicialización y generación de evidencias
tests/modulo7.test.js         # Pruebas HTTP y PostgreSQL
docs/                        # Checklist y colección de Postman
output/                      # Evidencias y paquete de entrega
```

La organización de los archivos y la publicación de la entrega se detallan en [docs/entrega-modulo-7.md](docs/entrega-modulo-7.md).
