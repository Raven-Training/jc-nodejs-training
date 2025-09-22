# jc-nodejs-training
 
 English version: [README.en.md](./README.en.md)
 
 Plataforma de entrenamiento en Node.js con TypeScript utilizando Express, TypeORM y PostgreSQL. Este proyecto sirve como base para construir APIs REST con buenas prácticas de estructura, configuración y calidad de código.

 ---

 ## Características
 - **Express 5** para la capa HTTP y middlewares.
 - **TypeScript** con configuración estricta y soporte de decoradores.
 - **TypeORM** para acceso a datos y entidades con PostgreSQL.
 - **Gestión de variables** con `dotenv` y archivo `.env.example`.
 - **Estilo y calidad** con ESLint + Prettier.
 - **Tests** listos con Jest y Supertest.

 ---

 ## Requisitos
 - Node.js `22.18.0`
 - npm `10.9.3`
 - PostgreSQL (local o remoto)

 Verifica tu versión de Node/npm:
 ```bash
 node -v
 npm -v
 ```

 ---

 ## Configuración de variables de entorno
 Este proyecto utiliza variables de entorno para configuración. No compartas secretos en el repositorio.

 1) Copia el archivo de ejemplo y complétalo:
 ```bash
 cp .env.example .env
 ```
 2) Edita `.env` con tus valores locales. Variables disponibles:
 - `NODE_ENV` (por defecto: `development`)
 - `PORT` Puerto HTTP de la API (por defecto: `3000`)
 - `DB_HOST` Host de la base de datos (por defecto: `localhost`)
 - `DB_PORT` Puerto de la base de datos (por defecto: `5432`)
 - `DB_USERNAME` Usuario de la base de datos
 - `DB_PASSWORD` Contraseña de la base de datos
 - `DB_NAME` Nombre de la base de datos
 - `TODOS_API_BASE_URL` Base URL para API externa de Todos (por defecto: `https://jsonplaceholder.typicode.com`)

 Las variables se consumen desde `src/config/config.ts` mediante `process.env`.

 ---

 ## Instalación
 Instala dependencias:
 ```bash
 npm install
 ```

 ---

 ## Scripts disponibles
 Los scripts están definidos en `package.json`.

 - `npm run dev`: Arranca el servidor en desarrollo con recarga (ts-node-dev).
 - `npm run build`: Compila TypeScript a JavaScript en `dist/`.
 - `npm start`: Compila y levanta el servidor desde `dist/`.
 - `npm test`: Ejecuta los tests con Jest.
 - `npm run test:watch`: Ejecuta tests en modo watch.
 - `npm run test:cov`: Genera reporte de cobertura.
 - `npm run lint`: Linter (ESLint) sobre archivos `.ts`.
 - `npm run lint:fix`: Linter con autofix.

 ---

 ## Inicio rápido
 1) Clonar repositorio y entrar al directorio del proyecto
 2) Crear `.env` a partir de `.env.example`
 3) Instalar dependencias: `npm install`
 4) Asegurar que PostgreSQL esté disponible y credenciales correctas
 5) Modo desarrollo:
 ```bash
 npm run dev
 ```
 El servidor corre en `http://localhost:3000` (o el puerto definido en `PORT`).

 Producción/local build:
 ```bash
 npm start
 ```

 ---

 ## Endpoints
 Rutas definidas en `src/routes.ts` y controladores en `src/controllers/`.

 - `GET /health` Health check
 - `GET /users` Lista usuarios
 - `POST /users` Crea usuario (JSON body)
 - `GET /users/:id` Obtiene usuario por id
 - `GET /todos` Lista de todos (proxy a `TODOS_API_BASE_URL`)

 Ejemplos:
 ```bash
 curl http://localhost:3000/health

 curl http://localhost:3000/users

 curl -X POST http://localhost:3000/users \
   -H "Content-Type: application/json" \
   -d '{"name":"John Doe","email":"john@example.com"}'

 curl http://localhost:3000/users/1

 curl http://localhost:3000/todos
 ```

 Documentación estática (si aplica): `GET /docs` sirve archivos desde `src/docs/` en build.

 ---

 ## Estructura del proyecto
 ```
 src/
 ├─ app.ts                # Configuración de Express y middlewares
 ├─ server.ts             # Bootstrap del servidor y conexión DB
 ├─ routes.ts             # Definición de rutas
 ├─ config/
 │  ├─ config.ts          # Carga de variables de entorno
 │  └─ config.types.ts    # Tipos de configuración
 ├─ controllers/          # Controladores HTTP
 ├─ entities/             # Entidades TypeORM
 ├─ middlewares/          # Middlewares (error handling, etc.)
 ├─ data-source.ts        # Configuración de TypeORM DataSource
 ├─ migrations/           # Migraciones (si se usan)
 └─ services/             # Lógica de negocio
 ```

 ---

 ## Base de datos
 - ORM: TypeORM (`src/data-source.ts`)
 - Por defecto `synchronize: true` (solo para desarrollo). Para producción, desactiva `synchronize` y usa migraciones.

 ---

 ## Calidad de código
 - ESLint y Prettier configurados. Revisa con:
 ```bash
 npm run lint
 npm run lint:fix
 ```
 - `lint-staged` está configurado para formatear/lint en staged files.

 ---

 ## Tecnologías principales
 - Node.js, TypeScript, Express 5
 - TypeORM, PostgreSQL
 - Axios, CORS, http-status
 - Jest, Supertest

 ---

 ## Contribución
 1) Crea una rama de feature
 2) Asegúrate de pasar linters y tests
 3) Abre un Pull Request con descripción clara

 ---

 ## Licencia
 ISC
