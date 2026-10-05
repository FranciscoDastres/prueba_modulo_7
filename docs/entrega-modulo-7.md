# Entrega Parte 2 - Módulo 7

Pauta: `abp/💼Proyecto Módulo #7 - ABP.pdf`, páginas impresas 11 a 15.

## Verificación técnica

| Punto de la pauta                            | Evidencia                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| Conexión PostgreSQL y credenciales ocultas   | `config/`, `.env.example`, log de arranque y prueba L1                     |
| Tabla principal y al menos tres usuarios     | `db/schema.sql`, `db/seed.sql` y pruebas L1/L2                             |
| Lectura sin datos sensibles y JSON ordenado  | GET `/usuarios` y pruebas L2                                               |
| Actualización y eliminación con ID existente | PUT/DELETE `/usuarios/:id` y pruebas L3                                    |
| Dos acciones consecutivas, COMMIT y ROLLBACK | POST `/usuarios`, modelo SQL y prueba L4 con error en la segunda inserción |
| Comparación SQL manual / ORM                 | prueba L5 y apartado de comparación en el informe                          |
| Dos modelos relacionados e include           | Usuario/Pedido, Perfil y pruebas L6                                        |
| CRUD sobre dos entidades y búsquedas         | rutas `/usuarios`, `/pedidos`, filtros y paginación                        |
| Organización, comentarios y justificaciones  | README principal, carpetas y decisiones técnicas                           |
| Ejecución desde consola                      | scripts `start`, `dev`, `db:init`, `test` y `verify`                       |

## Archivos listos para entregar

- [x] Código centrado en el módulo 7.
- [x] Base de datos reproducible y datos de demostración.
- [x] README con instalación, configuración, ejecución y decisiones técnicas.
- [x] Colección de Postman para lectura, creación, modificación y eliminación.
- [x] Informe HTML y JSON con verificaciones y respuestas HTTP reales.
- [x] Log de prueba con COMMIT y ROLLBACK.
- [x] Capturas de lectura, escritura, eliminación, relaciones y rollback.
- [x] Paquete ZIP sin credenciales ni `node_modules`.

## Publicación de la entrega

- [ ] Publicar los cambios en el repositorio GitHub `FranciscoDastres/prueba_modulo_7` y comprobar que el enlace entregado muestra esta versión.
- [ ] Crear o actualizar la subcarpeta **Parte 2 – Módulo 7** en el Google Drive de entrega.
- [ ] Subir allí `output/playwright/`, `output/evidencias/` y el enlace de GitHub. El ZIP puede adjuntarse como copia del código.
- [ ] Verificar que el evaluador tenga acceso al repositorio y a la carpeta Drive.

Estos últimos checks corresponden a la entrega externa. El informe técnico y los archivos se preparan localmente; no equivalen a una publicación en GitHub o Google Drive.

## Cómo revisar las evidencias

Abre `output/evidencias/verificacion.html` en un navegador. El informe identifica qué se probó, muestra los checks aprobados y registra cada solicitud/respuesta. La fecha corresponde a su última ejecución.

Para repetirlo, configura tu PostgreSQL en `.env`, ejecuta `npm run db:init` y `npm run verify`. Las evidencias JSON, HTML y TXT se regeneran. Las capturas incluidas documentan la ejecución verificada para esta entrega.

Los casos que devuelven 400, 404, 409, 413 o 500 comprueban situaciones inválidas deliberadas. Una prueba aprobada significa que el código respondió como correspondía y conservó la integridad de los datos.
