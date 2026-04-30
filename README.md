# ShopZone Frontend

ShopZone Frontend is a React application for browsing products, managing a cart, and managing a wishlist. It consumes the ShopZone Django backend API as its source of truth.

## Features

- Product listing with backend-driven pagination and filtering
- Product detail pages fetched from the API
- Auth, cart, and wishlist integration through Django endpoints
- Persistent authenticated shopping state

## Requirements

- Node.js 18 or later
- `npm`
- The ShopZone backend running locally or remotely

## Repository Layout

- `src/api/` - API client and backend request wrappers
- `src/pages/` - route-level screens
- `src/store/` - Zustand state for auth, cart, wishlist, theme, and search
- `src/components/` - UI and feature components

## Environment Variables

Create a local `.env` file from `.env.example` and set the backend base URL.

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_BASE_URL` | Base URL of the Django backend API |

Example:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

3. Update `.env` if your backend runs on a different host or port.

## Run the Application

Start the development server:

```bash
npm start
```

The app is available at:

```text
http://localhost:3000
```

## Production Build

Create a production build:

```bash
npm run build
```

## Backend Dependencies

The frontend expects the following backend APIs to be available:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/me/`
- `GET /api/products/`
- `GET /api/products/{id}/`
- `GET /api/cart/`
- `POST /api/cart/`
- `PATCH /api/cart/items/{id}/`
- `DELETE /api/cart/items/{id}/`
- `GET /api/wishlist/`
- `POST /api/wishlist/`
- `DELETE /api/wishlist/items/{id}/`

If the backend URL changes, update `REACT_APP_API_BASE_URL` in `.env`.

## Verification Checklist

- `npm install` completes successfully
- `npm start` launches the app on port `3000`
- Products load from the backend API
- Logged-in cart and wishlist state syncs with the backend
- Authenticated users cannot modify another user's cart or wishlist data

