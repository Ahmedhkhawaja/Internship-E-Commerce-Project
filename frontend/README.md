# Frontend Application

## Overview
React + Vite frontend for customers + admins, backed by Tailwind-style styling, Redux Toolkit state, and axios.

### State & Redux
- `authSlice` stores token in `localStorage`, calls `/api/auth/me` on load, and exposes login/logout thunks.
- `cartSlice` persists cart to `localStorage` and posts `{ items: [{ productId, quantity }] }` to `/api/orders`.

## Setup
1. `npm install`
2. Create `.env` (copy from `.env.example`) with:
   ```
   VITE_API_URL=http://localhost:5000
   ```

## Running
- `npm run dev`
- `npm run build`
- `npm run preview`

## Key Pages & Routes
### Customer
- `/products` – product listing
- `/product/:id` – (if implemented)
- `/login`, `/register`
- `/orders`, `/orders/:id`

### Admin
- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`
- `/admin/orders`
- `/admin/orders/:id`

## API Client
- Centralized axios instance in `src/api/http.js`.
- Honors `VITE_API_URL`.
- Attaches `Authorization` header when token exists.

## Testing
- `npm run test` (Vitest + React Testing Library).

## UI Notes
- Minimal Tailwind-inspired classes used for layout, tables, and buttons.
- Loading/error states are present on pages such as products/orders.

## Notes
- Admin routes rely on backend JWT + role checks.
- Keep backend running while developing the UI.
