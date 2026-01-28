# Backend Services

## Overview
REST API for auth, products, orders, and admin workflows with JWT-based protection.

## Node
Built for **Node 20 (recommended)**.

## Setup
1. `npm install`
2. Copy `.env.example` (create if missing) for dev and `.env.test` for CI/local tests.

### Environment variables
| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port (default 5000). |
| `MONGODB_KEY` | Mongo URI for production/dev. |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens. |
| `CORS_ORIGIN` | Allowed browser origin (frontend). |

`.env.test` mirrors the above but is used by Jest (`src/tests/setup.js`) along with `mongodb-memory-server`.

## Running
- `npm run dev` (dev server with nodemon)
- `npm start` (production server)

## API Endpoints
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PATCH /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Orders
- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders/:id`

### Admin Orders
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id`

## Auth details
- JWT sent in `Authorization: Bearer <token>`.
- Token payload contains `{ userId, role }`.
- `authUser` validates token; `authAdmin` checks `role === "admin"`.

## Testing
- `npm test` (Jest + Supertest, powered by mongodb-memory-server).
- `npm run test:coverage` (same suite + coverage report, thresholds enforced).

## Swagger
- Swagger spec lives in `src/swagger.js`.
- Visit `http://localhost:5000/api/docs` while backend is running to explore routes.

## Error handling
- Most controllers return `{ message }` on failure.
- Common statuses: 400 (validation), 401/403 (auth), 404 (not found), 409 (conflict), 500 (server).

## Project structure
- `src/routes` → Express route definitions with JSDoc for Swagger.
- `src/controllers` → Business logic.
- `src/models` → Mongoose schemas.
- `src/middleware` → JWT guards.
- `src/tests` → Jest/Supertest helpers + specs.

## Security notes
- Passwords hashed with bcrypt.
- Rate limiting/security middleware still to be layered in (helmet/xss/mongo-sanitize already installed).

## Notes
- CI workflow `.github/workflows/ci.yml` runs backend tests/coverage before frontend build.

