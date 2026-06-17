# Gigflow Backend

Node.js + Express + MongoDB backend using layered architecture with JWT cookie auth, role-based authorization, owner checks, and soft delete.

## Scripts

- `npm run dev` starts the server using nodemon.
- `npm start` starts the server using node.

## Environment Variables

Set these in `.env`:

- `PORT`
- `CLIENT_URL`
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRY`
- `JWT_REFRESH_EXPIRY`
- `NODE_ENV`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Users

- `GET /api/users` (ADMIN)
- `GET /api/users/:userId` (owner or ADMIN)
- `PATCH /api/users/:userId` (owner)
- `PATCH /api/users/:userId/change-password` (owner)
- `DELETE /api/users/:userId` (owner soft delete)
- `DELETE /api/users/:userId/admin-delete` (ADMIN soft delete)

## Response Shape

All responses follow:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "errors": null
}
```
