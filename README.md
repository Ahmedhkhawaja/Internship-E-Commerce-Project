# MERN Marketplace

Full-stack e-commerce project with a React/Vite storefront and Express/Mongo backend, documented by Swagger, secured with JWT auth, and Stripe Checkout for payments.

![Demo screenshot](frontend/public/vite.svg) <!-- swap with actual screenshot if available -->

## Key Features
- **Customer:** authentication, cart persistence, place orders, Stripe Checkout, order history and details.
- **Admin:** product CRUD, image upload (Cloudinary), order management with status updates, role-based route protection.

## Tech Stack
- **Backend:** Node 20, Express 5, MongoDB/Mongoose, bcrypt, JWT auth + refresh cookies, Stripe Checkout + webhooks, Cloudinary uploads, Jest/Supertest (mongodb-memory-server), Swagger docs, GitHub Actions CI.
- **Frontend:** React 19 + Vite, Tailwind-inspired utility classes, Redux Toolkit, axios client, Vitest + Testing Library.

## Architecture
- **Monorepo** with `backend/` and `frontend/`.
- **Backend** layers: `routes` → `controllers` → `models`, with middleware for auth and Swagger served from `src/swagger.js`.
- **Frontend** routes use `ProtectedRoute`/`AdminRoute`, Redux store rehydrates user on load, cart persists in localStorage.
- **Auth flow**: access token stored in `Authorization: Bearer <token>`, `/api/auth/me` validates calls, admin status comes from the JWT `role` claim.

## Local Setup
1. Clone repo and install deps in both packages:
   ```bash
   npm install        # installs root deps (if any)
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. Create `.env` files in backend (copy from `.env.example`) and frontend (set `VITE_API_URL=http://localhost:5000`).
3. Run backend: `cd backend && npm run dev`.
4. Run frontend: `cd frontend && npm run dev`.

## Testing
- Backend: `npm run test` / `npm run test:coverage` (uses mongodb-memory-server via `src/tests/setup.js`, coverage thresholds enforced: statements ≥ 75%, branches ≥ 50%, functions ≥ 70%, lines ≥ 75%).
- Frontend: `cd frontend && npm run test`.

## CI
- GitHub Actions workflow at `.github/workflows/ci.yml` runs backend tests/coverage followed by frontend build on every `push`/`pull_request`.

## API Docs
- Swagger UI is served at `http://localhost:5000/api/docs` courtesy of `swagger-ui-express` + `swagger-jsdoc`.

## Future Improvements
- Add automated frontend e2e tests, audit logging, and production-grade observability.

