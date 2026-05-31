# Voltaic API

REST API for managing EV charging infrastructure — users, companies, stations, support tickets, charging sessions, and vehicle catalogues.

## Tech Stack

- **Runtime:** Bun (recommended) or Node.js 18+
- **Framework:** Express 5 (ESM)
- **Database:** MongoDB 7 via Mongoose 9
- **Auth:** JWT (access + refresh tokens) with bcrypt password hashing
- **Email:** Mailtrap for password recovery
- **Docs:** Swagger (OpenAPI 3.0) via swagger-jsdoc + swagger-ui-express

## Project Structure

```
api/
├── server.js                    Entry point — connects DB, starts server
├── app.js                       Express app setup, routes, CORS, error handler
├── Dockerfile                   Multi-stage build (dev + production)
├── package.json
├── src/
│   ├── config/                  (reserved for config files)
│   ├── controllers/             Request handlers per resource
│   │   ├── auth.controller.js
│   │   ├── company.controller.js
│   │   ├── log.controller.js
│   │   ├── station.controller.js
│   │   ├── ticket.controller.js
│   │   ├── usage.controller.js
│   │   ├── user.controller.js
│   │   └── vehicle.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   JWT verification, role checks, ownership
│   │   └── error.middleware.js  Global error handler
│   ├── models/                  Mongoose schemas
│   │   ├── company.model.js
│   │   ├── group.model.js
│   │   ├── log.model.js
│   │   ├── refreshToken.model.js
│   │   ├── resetToken.model.js
│   │   ├── station.model.js
│   │   ├── ticket.model.js
│   │   ├── usage.model.js
│   │   ├── user.model.js
│   │   └── vehicle.model.js
│   ├── routes/                  Route definitions with JSDoc/OpenAPI
│   ├── services/
│   │   └── db.service.js        Mongoose connection
│   ├── utils/
│   │   ├── mailer.js            Mailtrap email sender
│   │   ├── paginate.js          Pagination helper
│   │   ├── response.js          Response formatters
│   │   └── utils.js             Misc utilities
│   └── swagger.js               OpenAPI spec definition
└── tests/jmeter/
    └── login_load.jmx           JMeter load test for login
```

## Setup

```bash
# Copy environment
cp .env.example .env

# Install dependencies
bun install
# or: npm install

# Start with hot reload
bun --watch server.js
# or: npx nodemon server.js
```

The API starts on `http://localhost:3000`.

## Environment Variables

| Variable                 | Required | Default | Description |
|--------------------------|----------|---------|-------------|
| `PORT`                   | No       | `3000`  | Server port |
| `MONGO_URI`              | Yes      | —       | MongoDB connection string |
| `JWT_SECRET`             | Yes      | —       | Access token signing secret |
| `JWT_EXPIRES_IN`         | No       | `1h`    | Access token TTL |
| `JWT_REFRESH_SECRET`     | Yes      | —       | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | No       | `7d`    | Refresh token TTL |
| `MAILTRAP_TOKEN`         | Yes*     | —       | Mailtrap API token (*required for password reset) |
| `NODE_ENV`               | No       | `development` | Environment |

## API Endpoints

All paths prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method   | Path                           | Auth     | Description |
|----------|--------------------------------|----------|-------------|
| `POST`   | `/api/users/login`              | —        | Login with email/password |
| `POST`   | `/api/users/register`           | —        | Create new account |
| `POST`   | `/api/users/refresh`            | —        | Rotate refresh token |
| `POST`   | `/api/users/logout`             | Required | Revoke refresh token |
| `POST`   | `/api/users/logout-all`         | Required | Revoke all sessions |
| `POST`   | `/api/users/validate-token`     | Required | Check token validity |
| `GET`    | `/api/users/me`                 | Required | Current user profile |
| `POST`   | `/api/users/forgot-password`    | —        | Request password reset email |
| `POST`   | `/api/users/forgot-password/:token` | —    | Validate reset token |
| `POST`   | `/api/users/reset-password`     | —        | Set new password |

### Users

| Method   | Path                                    | Auth       | Roles       |
|----------|-----------------------------------------|------------|-------------|
| `GET`    | `/api/users`                            | Required   | admin       |
| `POST`   | `/api/users`                            | —          | —           |
| `GET`    | `/api/users/me`                         | Required   | any         |
| `PATCH`  | `/api/users/me`                         | Required   | any         |
| `DELETE` | `/api/users/me`                         | Required   | any         |
| `GET`    | `/api/users/me/favorites`               | Required   | any         |
| `POST`   | `/api/users/me/favorites`               | Required   | any         |
| `DELETE` | `/api/users/me/favorites/:stationId`    | Required   | any         |
| `GET`    | `/api/users/me/favorites/stations`      | Required   | any         |
| `GET`    | `/api/users/my_company`                 | Required   | company-manager, worker |
| `GET`    | `/api/users/my_company/stations`        | Required   | company-manager, worker |
| `GET`    | `/api/users/my_company/tickets`         | Required   | company-manager, worker |
| `GET`    | `/api/users/me/vehicles`                | Required   | any         |
| `POST`   | `/api/users/me/vehicles`                | Required   | any         |
| `PATCH`  | `/api/users/me/vehicles/:plate`         | Required   | any         |
| `DELETE` | `/api/users/me/vehicles/:plate`         | Required   | any         |
| `GET`    | `/api/users/me/usages`                  | Required   | any         |
| `GET`    | `/api/users/me/tickets`                 | Required   | any         |
| `GET`    | `/api/users/:id`                        | Required   | any         |
| `PATCH`  | `/api/users/:id`                        | Required   | admin       |
| `DELETE` | `/api/users/:id`                        | Required   | admin       |
| `GET`    | `/api/users/me/vehicles`                | Required   | any         |

### Companies

| Method   | Path                                     | Auth       | Roles               |
|----------|------------------------------------------|------------|---------------------|
| `GET`    | `/api/companies`                         | —          | —                   |
| `POST`   | `/api/companies`                         | Required   | admin               |
| `GET`    | `/api/companies/:id`                     | Required   | any                 |
| `PATCH`  | `/api/companies/:id`                     | Required   | admin, company-manager |
| `DELETE` | `/api/companies/:id`                     | Required   | admin, company-manager |
| `GET`    | `/api/companies/:id/groups`              | Required   | any                 |
| `PATCH`  | `/api/companies/:id/groups/assign`       | Required   | admin               |
| `PATCH`  | `/api/companies/:id/groups/unassign`     | Required   | admin               |
| `GET`    | `/api/companies/me/dashboard`            | Required   | company-manager, admin |
| `GET`    | `/api/companies/me/dashboard/week`       | Required   | company-manager, admin |

### Stations

| Method   | Path                                    | Auth       | Roles                        |
|----------|-----------------------------------------|------------|------------------------------|
| `GET`    | `/api/stations`                         | Required   | any (dashboard: admin)       |
| `POST`   | `/api/stations`                         | Required   | admin                        |
| `GET`    | `/api/stations/:id`                     | Required   | any                          |
| `PATCH`  | `/api/stations/:id`                     | Required   | admin, company-manager, worker |
| `DELETE` | `/api/stations/:id`                     | Required   | admin                        |
| `POST`   | `/api/stations/:stationId/execute`      | Required   | admin, company-manager, worker |
| `GET`    | `/api/stations/:stationId/usages`       | Required   | any                          |
| `GET`    | `/api/stations/:stationId/tickets`      | Required   | company-manager, worker      |

### Tickets

| Method   | Path              | Auth       | Roles                      |
|----------|-------------------|------------|----------------------------|
| `POST`   | `/api/tickets`    | Required   | any                        |
| `GET`    | `/api/tickets`    | Required   | admin                      |
| `PATCH`  | `/api/tickets/:id`| Required   | admin, company-manager     |
| `DELETE` | `/api/tickets/:id`| Required   | admin                      |

### Usages

| Method   | Path                 | Auth       | Roles |
|----------|----------------------|------------|-------|
| `POST`   | `/api/usages`        | Required   | any   |
| `GET`    | `/api/usages`        | Required   | any   |
| `GET`    | `/api/usages?state=active` | Required   | admin |
| `GET`    | `/api/usages/:id`    | Required   | any   |
| `PATCH`  | `/api/usages/:id`    | Required   | any   |

### Logs

| Method   | Path              | Auth       | Roles |
|----------|-------------------|------------|-------|
| `GET`    | `/api/logs`       | Required   | any   |
| `POST`   | `/api/logs`       | Required   | any   |
| `DELETE` | `/api/logs/:id`   | Required   | admin |

### Vehicles

| Method | Path              | Auth | Description          |
|--------|-------------------|------|----------------------|
| `GET`  | `/api/vehicles`   | —    | EV catalogue (public)|

### System

| Method | Path          | Description        |
|--------|---------------|--------------------|
| `GET`  | `/api/status` | Health check       |
| `GET`  | `/docs`       | Swagger UI         |
| `GET`  | `/docs.json`  | OpenAPI spec (JSON)|

### Query Parameters

Most `GET` list endpoints support:

| Parameter | Type    | Description |
|-----------|---------|-------------|
| `page`    | integer | Page number (default: 1) |
| `limit`   | integer | Items per page (default: 20) |
| `search`  | string  | Full-text search |
| `sort`    | string  | Sort field |
| `view`    | string  | Alternative response format (e.g. `dashboard`, `admin`) |

Station list additionally supports:
- `near` — `lat,lng` for geospatial queries
- `maxDistance` — radius in km from `near`

## Pagination

Paginated responses follow this shape:

```json
{
  "data": [],
  "page": 1,
  "limit": 20,
  "total": 100,
  "pages": 5
}
```

## Authentication Flow

1. **Register** — `POST /api/users/register` with username, email, password
2. **Login** — `POST /api/users/login` returns `token` (access, short-lived) and `refreshToken` (long-lived)
3. **Authenticate** — include `Authorization: Bearer <token>` in protected requests
4. **Refresh** — `POST /api/users/refresh` with `{ refreshToken }` when access token expires (rotation enabled)
5. **Logout** — `POST /api/users/logout` revokes the refresh token

## Roles & Permissions

| Action                     | client | worker | company-manager | admin |
|----------------------------|--------|--------|-----------------|-------|
| Browse stations            | ✅     | ✅     | ✅              | ✅    |
| Manage own profile         | ✅     | ✅     | ✅              | ✅    |
| Own vehicles/favorites     | ✅     | ✅     | ✅              | ✅    |
| Create tickets             | ✅     | ✅     | ✅              | ✅    |
| Start/end charging         | ✅     | ✅     | ✅              | ✅    |
| Edit own company stations  | —      | ✅     | ✅              | ✅    |
| Company dashboard          | —      | —      | ✅              | ✅    |
| Manage users/roles         | —      | —      | ✅*             | ✅    |
| Create/delete companies    | —      | —      | —               | ✅    |
| Delete stations/tickets    | —      | —      | —               | ✅    |
| Full admin panel           | —      | —      | —               | ✅    |

\* company-manager can only update roles within their own company.

## Error Handling

Errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "details": {}
}
```

HTTP status codes: `400` (validation), `401` (unauthorized), `403` (forbidden), `404` (not found), `500` (server error).

## Testing

```bash
# JMeter load test for login endpoint
jmeter -n -t tests/jmeter/login_load.jmx
```

## Docker

```bash
# Build
docker build -t voltaic-api .

# Run (requires MongoDB)
docker run -p 3000:3000 --env-file .env voltaic-api
```

See `compose.yaml` at the project root for the full stack setup.
