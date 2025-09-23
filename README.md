# jc-nodejs-training
[![CI](https://github.com/Raven-Training/jc-nodejs-training/actions/workflows/ci.yml/badge.svg)](https://github.com/Raven-Training/jc-nodejs-training/actions/workflows/ci.yml)

Node.js training platform with TypeScript using Express, TypeORM, and PostgreSQL. This project serves as a base to build REST APIs with best practices for structure, configuration, and code quality.

---

## Features
- **Express 5** for HTTP layer and middlewares.
- **TypeScript** with strict configuration and decorator support.
- **TypeORM** for data access and entities with PostgreSQL.
- **Environment variable management** with `dotenv` and `.env.example` file.
- **Style and quality** with ESLint + Prettier.
- **Ready-to-use tests** with Jest and Supertest.

---

## Requirements
- Node.js `22.18.0`
- npm `10.9.3`
- PostgreSQL (local or remote)

Check your Node/npm version:
```bash
node -v
npm -v
```

---

## Environment variable setup
This project uses environment variables for configuration. Do not share secrets in the repository.

1) Copy the example file and fill it in:
```bash
cp .env.example .env
```
2) Edit `.env` with your local values. Available variables:
- `NODE_ENV` (default: `development`)
- `PORT` API HTTP port (default: `3000`)
- `DB_HOST` Database host (default: `localhost`)
- `DB_PORT` Database port (default: `5432`)
- `DB_USERNAME` Database user
- `DB_PASSWORD` Database password
- `DB_NAME` Database name
- `TODOS_API_BASE_URL` Base URL for external Todos API (default: `https://jsonplaceholder.typicode.com`)

Variables are consumed from `src/config/config.ts` using `process.env`.

---

## Installation
Install dependencies:
```bash
npm install
```

---

## Available scripts
Scripts are defined in `package.json`.

- `npm run dev`: Starts the server in development mode with hot reload (ts-node-dev).
- `npm run build`: Compiles TypeScript to JavaScript in `dist/`.
- `npm start`: Compiles and runs the server from `dist/`.
- `npm test`: Runs tests with Jest.
- `npm run test:watch`: Runs tests in watch mode.
- `npm run test:cov`: Generates coverage report.
- `npm run lint`: Linter (ESLint) for `.ts` files.
- `npm run lint:fix`: Linter with autofix.

---

## Quick start
1) Clone the repository and enter the project directory
2) Create `.env` from `.env.example`
3) Install dependencies: `npm install`
4) Make sure PostgreSQL is available and credentials are correct
5) Development mode:
```bash
npm run dev
```
The server runs at `http://localhost:3000` (or the port defined in `PORT`).

Production/local build:
```bash
npm start
```

---

## Endpoints
Routes are defined in `src/routes.ts` and controllers in `src/controllers/`.

- `GET /health` Health check
- `GET /users` List users
- `POST /users` Create user (JSON body)
- `GET /users/:id` Get user by id
- `GET /todos` Todos list (proxy to `TODOS_API_BASE_URL`)

Examples:
```bash
curl http://localhost:3000/health

curl http://localhost:3000/users

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

curl http://localhost:3000/users/1

curl http://localhost:3000/todos
```

Static documentation (if applicable): `GET /docs` serves files from `src/docs/` in build.

---

## Project structure
```
src/
├─ app.ts                # Express configuration and middlewares
├─ server.ts             # Server bootstrap and DB connection
├─ routes.ts             # Route definitions
├─ config/
│  ├─ config.ts          # Environment variable loading
│  └─ config.types.ts    # Configuration types
├─ controllers/          # HTTP controllers
├─ entities/             # TypeORM entities
├─ middlewares/          # Middlewares (error handling, etc.)
├─ data-source.ts        # TypeORM DataSource configuration
├─ migrations/           # Migrations (if used)
└─ services/             # Business logic
```

---

## Database
- ORM: TypeORM (`src/data-source.ts`)
- Default `synchronize: true` (development only). For production, disable `synchronize` and use migrations.

---

## Code quality
- ESLint and Prettier configured. Check with:
```bash
npm run lint
npm run lint:fix
```
- `lint-staged` is configured to format/lint staged files.

---

## Main technologies
- Node.js, TypeScript, Express 5
- TypeORM, PostgreSQL
- Axios, CORS, http-status
- Jest, Supertest

---

## Contribution
1) Create a feature branch
2) Make sure to pass linters and tests
3) Open a Pull Request with a clear description

---

## License
ISC
 
