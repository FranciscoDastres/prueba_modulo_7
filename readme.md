# Aplicación Web para Gestión de Usuarios y Datos (API RESTful)

**Repositorio:** [FranciscoDastres/prueba_modulo_6_7_8](https://github.com/FranciscoDastres/prueba_modulo_6_7_8)

Servidor backend desarrollado con Node.js, Express y PostgreSQL. La aplicación implementa operaciones CRUD con consultas SQL nativas y Sequelize ORM, transaccionalidad mediante la gestión de clientes en pool, autenticación de usuarios basada en JSON Web Tokens (JWT) y carga segura de archivos con Multer.

---

## 🛠️ Tecnologías Utilizadas

- **Node.js** (v18+) & **Express.js**
- **PostgreSQL** (Base de datos relacional)
- **pg (node-postgres)** (Driver nativo SQL)
- **Sequelize** (ORM para mapeo relacional)
- **jsonwebtoken (JWT)** (Autenticación y rutas protegidas)
- **bcryptjs** (Hashing de contraseñas)
- **Multer** (Gestión y almacenamiento de archivos)
- **dotenv** (Gestión de variables de entorno)

---

## 📁 Estructura del Proyecto

```text
prueba_modulo_6_7_8/
├── config/
│   ├── db.js                # Conexión nativa mediante pg.Pool
│   └── sequelize.js         # Instancia y configuración de Sequelize ORM
├── controllers/
│   ├── auth.controller.js   # Registro, login y subida de archivos
│   ├── orm.controller.js      # Consultas avanzadas e includes con ORM
│   └── usuarios.controller.js # Operaciones CRUD nativas y transacciones
├── middlewares/
│   ├── auth.middleware.js   # Verificación y decodificación de JWT
│   └── upload.middleware.js # Configuración y validaciones de Multer
├── models/
│   ├── auth.model.js        # Persistencia de credenciales e imagen
│   ├── usuarios.model.js    # Consultas SQL nativas y bloques de transacción
│   └── orm/
│       ├── Usuario.js       # Modelo Sequelize para la entidad usuarios
│       ├── Pedido.js        # Modelo Sequelize para la entidad pedidos
│       └── index.js         # Definición de relaciones 1:N
├── routes/
│   ├── auth.routes.js       # Endpoints de autenticación y carga de avatar
│   ├── orm.routes.js        # Endpoints expuestos con Sequelize ORM
│   └── usuarios.routes.js   # Endpoints para la gestión nativa de usuarios
├── uploads/                 # Directorio de almacenamiento estático
├── .env                     # Variables de entorno (ignorado en Git)
├── package.json             # Dependencias del proyecto
└── server.js                # Punto de entrada de la aplicación
```
