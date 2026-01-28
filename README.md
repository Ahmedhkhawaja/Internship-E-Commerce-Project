# MERN E-commerce Platform

## Overview
Full-stack shopping experience with protected user journeys, administrative controls, and a modern React/Express/MongoDB stack designed for reliability and maintainability.

## Key Features
- **Customer experience** – browse products, manage cart, place orders, and view order history via guarded routes and persisted context.
- **Admin experience** – manage products, watch incoming orders, and change order status while viewing customer emails and payment-ready state.

## Tech Stack
- **Frontend:** React 19, Vite, React Router, Tailwind-style classes, Axios.
- **Backend:** Node 20, Express 5, MongoDB (via Mongoose), JWT auth, bcrypt, Stripe (placeholder for future), OpenAPI/Swagger.
- **Testing & DevOps:** Jest + Supertest, mongodb-memory-server, GitHub Actions for CI, Swagger UI documentation.

## Architecture Overview
- **Backend:** layered into routes → controllers → models, with middleware for auth and centralized utilities such as Swagger/OpenAPI and database init.
- **Frontend:** Contexts for auth/cart, route guards for protected/admin areas, and dedicated pages for user/admin workflows.
- **API docs:** Swagger spec served from `backend/src/swagger.js` and exposed on `/api/docs`.

## Local Setup
### Backend
1. Copy `.env.example` (create if missing) or add a `.env` with:
   ```env
   PORT=5000
   MONGODB_KEY=<your-mongo-connection-string>
   JWT_ACCESS_SECRET=your_secret
   ```
2. Install dependencies with `npm install`.
3. Start dev server: `npm run dev`.

### Frontend
1. Install dependencies: `cd frontend && npm install`.
2. Start dev server: `npm run dev`.

## Testing
- **Run backend tests:** `npm run test:coverage` (executes Jest with mongodb-memory-server so tests never hit a real database).
- **Coverage report:** same command produces detailed coverage output; thresholds enforced at statements ≥ 75, branches ≥ 50, functions ≥ 70, lines ≥ 75.
- **Frontend verification:** `npm run build` in the `frontend` folder ensures production artifacts compile cleanly.

## CI
- GitHub Actions workflow at `.github/workflows/ci.yml`.
- Triggers on `push` and `pull_request`.
- Backend job installs dependencies and runs `npm run test:coverage`.
- Frontend job installs dependencies and runs `npm run build`.

## API Documentation
- Swagger UI available after starting the backend: `http://localhost:5000/api/docs`.
- Docs are generated from JSDoc comments located in `backend/src/routes`.

## Future Improvements
- Add Stripe payment handling (checkout + webhook flows) and webhook secret rotation once back in Sydney.

