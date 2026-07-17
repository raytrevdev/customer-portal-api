# Customer Portal API

A RESTful backend for a customer-facing portal. Customers can register, authenticate,
manage their profile and orders; administrators can manage customers and all orders.

Built with **Node.js, Express, Sequelize and PostgreSQL**, following a layered
(Clean-Architecture-style) design with the Repository Pattern, JWT authentication,
role-based authorization, global error handling, structured logging and
auto-generated Swagger documentation.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Quick start with Docker (recommended)](#quick-start-with-docker-recommended)
- [Manual setup (without Docker)](#manual-setup-without-docker)
- [Environment variables](#environment-variables)
- [Seeded accounts & data](#seeded-accounts--data)
- [API overview](#api-overview)
- [Swagger / OpenAPI documentation](#swagger--openapi-documentation)
- [Running the tests](#running-the-tests)
- [A note on the brief's .NET references](#a-note-on-the-briefs-net-references)

---

## Tech stack

| Concern | Choice |
|---|---|
| Runtime | Node.js 22 (latest LTS) |
| Web framework | Express |
| ORM & migrations | Sequelize + sequelize-cli (code-first migrations) |
| Database | PostgreSQL 16 |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs` password hashing |
| Authorization | Role-based (customer / admin) |
| Validation | `express-validator` |
| Logging | Winston (console + file transports) |
| API docs | Swagger / OpenAPI (`swagger-jsdoc` + `swagger-ui-express`) |
| Security | `helmet`, `cors` |
| Testing | Jest + Supertest |
| Containerisation | Docker + Docker Compose |

## Architecture

The code is organised into clear layers so that each has a single responsibility
and dependencies point inward:

```
Route  ->  Validation MW  ->  Auth/Role MW  ->  Controller  ->  Service  ->  Repository  ->  Model / PostgreSQL
                                                                     |
                                              (errors bubble up to the global error handler)
```

- **Routes** declare endpoints and carry the Swagger annotations.
- **Controllers** handle HTTP only (parse the request, shape the response).
- **Services** hold all business rules and are framework-agnostic.
- **Repositories** are the *only* layer that touches Sequelize, keeping the ORM
  abstracted away from business logic (the Repository Pattern).
- **Models** define the schema and associations.

Cross-cutting concerns (authentication, authorization, validation, logging and
error handling) live in dedicated middleware. SOLID principles and dependency
injection are applied throughout.

## Project structure

```
customer-portal-api/
├── src/
│   ├── config/         # env, database, logger (Winston), swagger, sequelize-cli config
│   ├── models/         # Sequelize models + associations
│   ├── repositories/   # data-access layer (abstracts Sequelize)
│   ├── services/       # business logic
│   ├── controllers/    # HTTP request handlers
│   ├── routes/         # endpoint definitions + Swagger annotations
│   ├── middlewares/    # auth, authorize, validate, requestLogger, errorHandler
│   ├── validators/     # express-validator schemas
│   ├── utils/          # ApiError, response, jwt, password, pagination, asyncHandler
│   └── app.js          # Express app assembly
├── migrations/         # code-first database migrations
├── seeders/            # seed admin user + sample products
├── tests/              # Jest + Supertest unit/integration tests
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── .env.example
└── server.js           # entry point
```

## Quick start with Docker (recommended)

**Prerequisite:** Docker Desktop (Docker + Docker Compose).

```bash
# 1. Clone and enter the project
git clone <repo-url> customer-portal-api
cd customer-portal-api

# 2. Create your environment file (defaults work out of the box)
cp .env.example .env

# 3. Build and start everything
docker compose up --build
```

That single command will:

1. Start a PostgreSQL container and wait until it is healthy.
2. Run all database migrations automatically.
3. Seed an admin account and sample products.
4. Start the API.

When it is up:

- API base URL: `http://localhost:3000`
- **Swagger UI: `http://localhost:3000/api-docs`**

To stop and remove everything (including the database volume):

```bash
docker compose down -v
```

## Manual setup (without Docker)

**Prerequisites:** Node.js 22+ and a running PostgreSQL 16 instance.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    Edit .env: set DB_HOST=localhost and your Postgres credentials.
#    Make sure the database named in DB_NAME exists (createdb customer_portal).

# 3. Run migrations and seed data
npm run migrate
npm run seed

# 4. Start the server
npm run dev      # development (auto-reload)
# or
npm start        # production
```

## Environment variables

All variables live in `.env` (see `.env.example`).

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | API port | `3000` |
| `DB_HOST` | DB host — `db` for Docker, `localhost` for manual | `db` |
| `DB_PORT` | DB port | `5432` |
| `DB_NAME` | Database name | `customer_portal` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | Secret used to sign JWTs | *(set your own)* |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |
| `ADMIN_EMAIL` | Seeded admin email | `admin@portal.com` |
| `ADMIN_PASSWORD` | Seeded admin password | `Admin@123` |

## Seeded accounts & data

The seeder creates one administrator and a small product catalogue:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@portal.com` | `Admin@123` |

Register your own customer account via `POST /api/auth/register` to explore the
customer-facing endpoints.

## API overview

All responses share a consistent envelope: `{ success, message, data? }`.
Protected endpoints require an `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new customer |
| POST | `/api/auth/login` | Log in, returns a JWT |

### Customer (authenticated)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers/me` | View my profile |
| PUT | `/api/customers/me` | Update my profile |
| PATCH | `/api/customers/me/password` | Change my password |
| GET | `/api/products` | List available products |
| GET | `/api/orders` | View my order history (paginated) |
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders/:id` | View an order and its status |
| PATCH | `/api/orders/:id/cancel` | Cancel an order (only while pending) |

### Admin (authenticated + admin role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/customers` | View all customers (paginated) |
| DELETE | `/api/admin/customers/:id` | Delete a customer |
| PATCH | `/api/admin/customers/:id/deactivate` | Deactivate a customer |
| GET | `/api/admin/orders` | View all orders (paginated) |
| PATCH | `/api/admin/orders/:id/status` | Update an order's status |

### Example: end-to-end flow

```bash
# Log in as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"Admin@123"}'

# Register a customer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Secret@123"}'

# List products (use the token from register/login)
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>"

# Place an order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"<product-id>","quantity":2}]}'
```

## Swagger / OpenAPI documentation

The documentation is generated automatically from the route annotations when the
API runs — no manual step required.

- Interactive UI: **`http://localhost:3000/api-docs`**
- Raw spec (JSON): `http://localhost:3000/api-docs.json`

To authorize protected endpoints in Swagger UI: call `POST /api/auth/login`,
copy the returned `token`, click **Authorize** (top right), paste the token, and
all subsequent requests will include it.

## Running the tests

```bash
npm test
```

The suite (Jest + Supertest) covers the business logic (authentication, order
totals, cancellation and status rules, admin guards), the middleware
(role-based authorization, validation, global error handling), the HTTP layer
(routing, auth guards, 404s) and verifies the generated Swagger spec. The tests
mock the data-access layer, so they run anywhere without a database.

## A note on the brief's .NET references

The scenario document specifies **Node.js**, but a few requirements reference
.NET-specific tooling (Entity Framework Core, Serilog). Those were interpreted as
the *concepts* they represent and implemented with their Node.js equivalents:

| Brief (.NET) | Implemented (Node.js) |
|---|---|
| Entity Framework Core + code-first migrations | Sequelize + sequelize-cli migrations |
| Repository Pattern abstracting EF Core | Repository layer abstracting Sequelize |
| Serilog logging | Winston logging |

All functional requirements — JWT auth, role-based authorization, global error
handling, logging, Swagger docs, code-first migrations, and a layered
architecture — are fully implemented.
