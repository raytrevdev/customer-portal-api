# Technical Write-Up — Customer Portal API

## 1. Approach

I built the Customer Portal API as a layered Node.js/Express service backed by
PostgreSQL through Sequelize. My priority was to satisfy every functional and
technical requirement in the brief while keeping the codebase clean, readable and
easy for a reviewer to run and reason about.

I started by modelling the domain (customers, orders, order items, products),
then worked outward in layers: models → repositories → services → controllers →
routes, adding cross-cutting middleware (authentication, authorization,
validation, logging, error handling) around them. Documentation (Swagger) and a
one-command Docker setup were treated as first-class deliverables rather than an
afterthought, because "easy to run locally" was called out explicitly in the
brief.

## 2. Key design decisions

**Layered architecture with the Repository Pattern.** Controllers handle HTTP
only; services contain business rules; repositories are the single place that
touches the ORM. This keeps business logic independent of Sequelize and if the data
layer ever changed, services would be unaffected and it made the logic trivial
to unit-test by mocking repositories. This directly maps to the brief's request
for Clean Architecture, separation of concerns and abstracting the ORM from
business logic.

**Consistent contracts.** Every response uses a `{ success, message, data }`
envelope, and every error flows through a single global error handler that maps
known cases (validation, unique-constraint, not-found, unauthorized) to the right
HTTP status. A custom `ApiError` class carries the status code from deep in the
services up to that handler, so controllers stay free of error-handling clutter.

**Security by default.** Passwords are hashed with bcrypt and never returned (the
model strips the hash in `toJSON`). Authentication is stateless via JWT; admin
endpoints are additionally gated by a role-based authorization middleware. `helmet`
and `cors` are enabled.

**Data integrity.** Placing an order computes the total from authoritative product
prices on the server (never trusting client-supplied prices) and writes the order
and its items inside a transaction, so a partial failure can never leave a
half-created order.

**Product catalogue.** I added a small `products` table (seeded) so orders
reference real products with server-side pricing, rather than free-text items.
This is closer to a real system and makes the order flow demonstrable end-to-end.

## 3. Interpreting the brief's .NET references

The scenario mandates Node.js but lists a few .NET-specific tools — Entity
Framework Core and Serilog. I treated these as the concepts they stand for and
used their Node equivalents: **Sequelize with sequelize-cli** for the ORM and
code-first migrations, a **repository layer** to abstract it, and **Winston** for
structured logging. All the underlying requirements (code-first migrations,
repository abstraction, logging of key events) are met.

## 4. Challenges and solutions

**Container start-up ordering.** The API container can start before PostgreSQL is
ready to accept connections, which would crash migrations. I solved this with a
Docker healthcheck on the database plus an entrypoint script that polls the DB and
only runs migrations, seeds and the server once it is genuinely reachable. So
`docker compose up` is reliable on a clean machine.

**Idempotent seeding.** Because the entrypoint may run on every container start, I
made the seeders idempotent (they check for an existing admin / existing products
before inserting), so restarting the stack never produces duplicates or errors.

**Reliable, portable tests.** To keep the test suite fast and runnable anywhere
without provisioning a database, I unit-tested the business logic and middleware
with the data-access layer mocked, and used Supertest for the database-independent
HTTP paths (routing, validation, auth guards, 404s). This verifies the parts most
likely to contain bugs, the rules and wiring while the full data path is
exercised interactively through Swagger against the Dockerised Postgres.

## 5. Bonus features

Pagination is implemented on all listing endpoints (customers, orders, products).
Email notifications and caching were scoped as optional and left out to keep the
core solution focused and robust; the layered design leaves clear seams to add
them (an notification service called from `OrderService`, a cache in the
repository layer) without disturbing existing code.

## 6. Scope and next steps

I deliberately scoped this submission around a solid, fully working core rather
than stretching to everything at once. The layered design leaves clear seams for
the natural next iteration: integration tests running against a dedicated
PostgreSQL test container in CI, a CI pipeline (lint + test on every push), and
the optional email-notification and caching bonuses. Drawing that line kept the
delivered solution focused, reliable and easy to extend.
