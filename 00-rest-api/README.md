# 00 — REST API

REST API for Fishspots, built with **Hono** + **Bun** + **SQLite** via **Drizzle ORM**.

## Tech stack

| Tool | Role |
|---|---|
| [Bun](https://bun.sh) | JavaScript runtime and package manager |
| [Hono](https://hono.dev) | Lightweight HTTP framework |
| [Drizzle ORM](https://orm.drizzle.team) | Type-safe ORM for SQLite |
| [drizzle-zod](https://orm.drizzle.team/docs/zod) | Auto-generates Zod schemas from Drizzle table definitions |
| [@hono/zod-validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator) | Request validation middleware for Hono |
| [Zod](https://zod.dev) | Schema validation |

## Installation

Install `bvm` (Bun version manager):

```sh
curl -fsSL https://github.com/owenizedd/bum/raw/main/install.sh | bash
```

Install the required Bun version:

```sh
bum use 1.3.11
```

Install dependencies:

```sh
bun install
```

## Running the server

**Development** — auto-restarts on file change:

```sh
bun run dev
```

**Production** — applies migrations then starts:

```sh
bun run start
```

The API is available at <http://localhost:3000>.

## SQLite database

The database is a local SQLite file managed by **Drizzle ORM** using Bun's built-in `bun:sqlite` driver (no external native bindings required).

### File location

| Environment | Path |
|---|---|
| Development | `sqlite.db` at the project root |
| Production (Railway) | `/data/sqlite.db` (persistent volume) |

The path can also be overridden with the `DATABASE_URL` environment variable.

### Schema

The `fishspots` table is defined in `src/resources/fishspots/fishspots.schema.ts`:

| Column | SQLite type | Description |
|---|---|---|
| `id` | INTEGER | Primary key, auto-incremented |
| `name` | TEXT | Spot name |
| `type` | TEXT | Spot type (lake, river…) |
| `fishs` | TEXT | Fish species present |
| `image` | TEXT | Image URL |
| `created_at` | INTEGER | Creation timestamp (Unix) |
| `updated_at` | INTEGER | Last update timestamp (Unix) |

`created_at` and `updated_at` are automatically set on insert via `$defaultFn`.

### Migrations

Drizzle Kit reads all `src/resources/**/*.schema.ts` files (configured in `drizzle.config.ts`) and pushes the schema directly to the database:

```sh
bun run db:push
```

Generated migration files are stored in the `drizzle/` folder.

## API endpoints

Base URL: `http://localhost:3000`

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/fishspots` | Return all spots |
| `GET` | `/fishspots/:id` | Return a single spot by ID |
| `POST` | `/fishspots` | Create a new spot |
| `PATCH` | `/fishspots/:id` | Update a spot |
| `DELETE` | `/fishspots/:id` | Delete a spot |

### Example — create a spot

```sh
curl -X POST http://localhost:3000/fishspots \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lac du Brochet",
    "type": "Lac",
    "fishs": "Brochet, Perche",
    "image": "https://example.com/lac.jpg"
  }'
```

Response `201`:

```json
{
  "id": 1,
  "name": "Lac du Brochet",
  "type": "Lac",
  "fishs": "Brochet, Perche",
  "image": "https://example.com/lac.jpg",
  "created_at": 1742598000,
  "updated_at": 1742598000
}
```

## Request validation

`POST /fishspots` is validated by **Zod** via the `@hono/zod-validator` middleware.

The insert schema is derived automatically from the Drizzle table definition, with `id`, `createdAt`, and `updatedAt` omitted since they are managed by the database:

```ts
// fishspots.schema.ts
export const insertFishspotSchema = createInsertSchema(fishspots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
```

If the request body does not match the schema, the middleware short-circuits and returns `400` before the handler runs.

## Project structure

```
src/
├── index.ts                          # Entry point — app setup and route mounting
├── core/
│   └── db.ts                         # SQLite connection via Drizzle (bun:sqlite)
└── resources/
    └── fishspots/
        ├── fishspots.schema.ts       # Drizzle table definition + inferred TS types
        ├── fishspots.validations.ts  # Zod type helpers for handler context
        ├── fishspots.routes.ts       # Route declarations + zValidator middleware
        ├── fishspots.test.ts         # Unit tests
        └── fishspots.handlers.ts     # Business logic (create, find, findOneById)
```

## Tests

Tests use **Bun's built-in test runner** (`bun:test`) — no extra dependency needed.

Hono's `app.request()` method lets you call the app directly without starting a real HTTP server, making tests fast and self-contained.

```sh
bun test
```

The test file lives alongside the code it tests:

```
src/resources/fishspots/fishspots.test.ts
```

### What is covered

| Test | Expected status |
|---|---|
| `POST /fishspots` with valid data | `201` + body contains the created spot |
| `POST /fishspots` with missing `name` | `400` (validation rejected by zValidator) |
