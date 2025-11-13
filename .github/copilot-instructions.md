<!-- Copilot/agent instructions for the `propostas-backend` repo -->
# Agent Quick Guide — propostas-backend

Purpose: give an AI coding agent just-enough, concrete knowledge to be productive in this small Node.js backend.

- **Big picture:** This is a minimal Node.js (ES module) Express API that talks to a Postgres DB (via `pg`) and issues JWTs for auth. The main entrypoint is `server.js`. The app serves a proposals API and a login endpoint and expects a Postgres schema with `usuarios` and `propostas` tables.

- **Key files to read first:** `server.js`, `package.json`, `.env`, `README.md`.

- **Runtime & scripts:** start with `npm start` (runs `node server.js`). There are no tests or build steps in `package.json`.

- **Environment:** uses `dotenv`. Important env vars (present in `.env`):
  - `DATABASE_URL` — full Postgres connection string (used to create `pg.Pool`).
  - `JWT_SECRET` — secret used by `jsonwebtoken` for signing/verifying tokens.
  - `SUPABASE_STORAGE_URL`, `SUPABASE_KEY` — Supabase storage integration keys (not used in `server.js` but present in repo `.env`).

- **Auth pattern:** `auth` middleware in `server.js` reads `Authorization` header and expects `Bearer <token>`. It calls `jwt.verify(token, process.env.JWT_SECRET)` and attaches `req.user` to the request. When modifying auth, preserve this shape.

- **DB usage examples (from `server.js`):**
  - Login: SELECT from `usuarios` by `email`. The code expects a field `senha_hash` to compare via `bcrypt.compare()`.
  - Propostas list: `SELECT * FROM propostas ORDER BY criado_em DESC` and returned as JSON. Assume `propostas` has a `criado_em` timestamp column used for ordering.

- **Language & messages:** code and API responses use Portuguese variable names and messages (e.g., `senha`, `usuário`, `Token inválido`). Keep responses and variable names consistent with the project language when adding new endpoints.

- **Port & host:** the server currently listens on port `10000` (hard-coded in `server.js`). If you need a different port for local dev, update `server.js` or set up a `PORT` env var and wire it in.

- **Conventions & gotchas specific to this repo:**
  - The project uses ESM (`"type": "module"` in `package.json`) — imports use `import` syntax.
  - SQL queries are raw strings in code (no ORM). Use parameterized queries (`$1`, `$2`, ...) as the code does.
  - Database column names are Portuguese (e.g., `senha_hash`, `criado_em`, `role`). Query and map them exactly.
  - Keep error responses small and in Portuguese to match existing behavior.

- **When changing DB access or auth:**
  - Verify queries' column names against the current DB schema (the code expects `usuarios.email`, `usuarios.senha_hash`, `usuarios.id`, `usuarios.role`).
  - Maintain token payload shape (`{ id, role }`) so clients depending on `role` keep working.

- **Security & secrets:** never commit real secrets. The repository already contains a `.env` file used for local dev; treat that content as sensitive. If you modify examples, redact secrets.

- **Common small tasks examples (how-to):**
  - Add a new protected endpoint: import `auth` (or use the existing middleware) and place it as the second argument: `app.get('/nova', auth, async (req,res)=>{...})`.
  - Add DB query: use the existing pool: `const { rows } = await pool.query('SELECT ... WHERE id=$1', [id]);` and return `rows` or `rows[0]`.

- **Files & symbols to reference when implementing or reviewing changes:**
  - `server.js` — main implementation and the place to find the `auth` middleware, login flow and `/propostas` route.
  - `package.json` — shows `start` script and ESM setting.
  - `.env` — local env vars used by the app.

If anything above is unclear or you need examples of more advanced tasks (migrations, tests, or Docker), tell me which area to expand and I will update this file.
