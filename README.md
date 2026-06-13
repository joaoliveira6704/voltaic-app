# Voltaic

Full-stack EV charging infrastructure management platform. Browse an interactive map of charging stations, manage charging sessions, handle support tickets, and oversee company fleets — all through a modern web interface backed by a REST API.

Website URL: https://voltaic.diacidos.pt/

## Monorepo Structure

```
voltaic-app/
├── api/              Express/Mongoose REST API
├── frontend/         Nuxt 4 + Vue 3 SPA
├── data-gen/         Python seed data generator
├── compose.yaml      Docker Compose — full stack
├── Makefile          Convenience dev commands
└── .env.example      Shared environment template
```

## Tech Stack

| Service     | Language   | Runtime/Framework             | Database              |
|-------------|------------|-------------------------------|-----------------------|
| **API**     | JavaScript | Express 5 on Bun              | MongoDB 7 + Redis     |
| **Frontend**| TypeScript | Nuxt 4 + Vue 3 + Pinia        | —                     |
| **Data Gen**| Python     | Faker + PyMongo               | MongoDB 7             |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)
- [Bun](https://bun.sh) (recommended) or Node.js 18+
- Python 3.9+ (for data-gen locally)

## Quick Start

### Full stack with Docker

```bash
# Start MongoDB, API, and Mongo Express
docker compose up --build
```

The API is at `http://localhost:3000`, Swagger docs at `http://localhost:3000/docs`, and Mongo Express at `http://localhost:8081`.

### Development mode (with hot reload)

Using the Makefile:

```bash
# macOS + Bun
make mac-bun-dev

# macOS + Node
make mac-node-dev

# Windows + Bun
make win-bun-dev

# Windows + Node
make win-node-dev
```

Or start each service individually:

```bash
# 1. Start MongoDB
docker compose up mongo

# 2. Start API
cd api && cp .env.example .env && bun install && bun --watch server.js

# 3. Start frontend
cd frontend && cp .env.example .env && bun install && bun run dev

# 4. (Optional) Seed data
cd data-gen && pip install -r requirements.txt && python main.py --all
```

### Stop

```bash
docker compose down -v
```

## Services

### API (`api/`)

Express 5 REST API with JWT authentication, role-based access control, and Swagger documentation. Eight resource groups: Auth, Users, Companies, Stations, Tickets, Usages, Logs, and Vehicles.

Port: `3000`  
Docs: `http://localhost:3000/docs`

### Frontend (`frontend/`)

Nuxt 4 SPA with interactive map (MapLibre GL), dark mode, i18n (en/pt/es), role-based dashboards, and charging station management.

Port: `5173`

### Data Generator (`data-gen/`)

CLI tool to seed MongoDB with realistic companies, station groups, users, stations, support tickets, usage logs, and EV vehicle catalogue data.

### Mongo Express

Web-based MongoDB admin UI for inspecting the database.

URL: `http://localhost:8081`

## Environment Variables

Each service has its own `.env.example`. Copy it to `.env` and adjust as needed.

### Root (`compose.yaml`)

| Variable             | Default |
|----------------------|---------|
| `MONGO_ROOT_USERNAME`| `admin` |
| `MONGO_ROOT_PASSWORD`| `secret`|
| `MONGO_DB`           | `app`   |
| `ME_USERNAME`        | `admin` |
| `ME_PASSWORD`        | `admin123` |
| `API_PORT`           | `3000`  |

### API (`api/.env`)

| Variable                  | Description |
|---------------------------|-------------|
| `MONGO_URI`               | MongoDB connection string |
| `JWT_SECRET`              | Access token signing key |
| `JWT_EXPIRES_IN`          | Access token TTL (e.g. `1h`) |
| `JWT_REFRESH_SECRET`      | Refresh token signing key |
| `JWT_REFRESH_EXPIRES_IN`  | Refresh token TTL (e.g. `7d`) |
| `MAILTRAP_TOKEN`          | Mailtrap API token for password reset emails |

### Frontend (`frontend/.env`)

| Variable                     | Default                    |
|------------------------------|----------------------------|
| `NUXT_PUBLIC_API_BASE_URL`   | `http://0.0.0.0:3000`      |

### Data Gen (`data-gen/.env`)

| Variable    | Default                                                    |
|-------------|------------------------------------------------------------|
| `MONGO_URI` | `mongodb://root:root@localhost:27018/voltaic-db?authSource=admin` |

## API Overview

All endpoints are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

| Resource     | Base Path              | Auth Required |
|--------------|------------------------|---------------|
| Users        | `/api/users`           | Mixed         |
| Companies    | `/api/companies`       | Mixed         |
| Stations     | `/api/stations`        | Yes           |
| Tickets      | `/api/tickets`         | Yes           |
| Usages       | `/api/usages`          | Yes           |
| Logs         | `/api/logs`            | Yes           |
| Vehicles     | `/api/vehicles`        | No            |

### Roles

- **`client`** — browse stations, manage own vehicles and favorites, create tickets, start charging sessions
- **`worker`** — same as client, plus manage stations and tickets within their company
- **`company-manager`** — same as worker, plus access company dashboard and manage users
- **`admin`** — full access to all resources

### Test Accounts

| Email | Password | Role |
|---|---|---|
| jonathonsuarez@outlook.com | 1@0FQZhy9#Ud | admin |
| courtneyhaynes@gmail.com | #k7bDVgPj+Ks | client |
| marywalker@proton.me | WR^UPIl8a_e0 | company-manager |
| andrewsmith@outlook.com | WHH%$Vpv(8Mx | company-manager |
| jessicabell@icloud.com | N78B9cNn_%y1 | client |
| peteroconnor@outlook.com | fA&)b(0cB&YO | worker |
| leslielucas@icloud.com | 48KLquzA+X1S | client |
| patriciaboyd@outlook.com | 7P4FnaaX&yhN | worker |
| lindagardner@gmail.com | _Ok@%%Vc79Lr | admin |
| thomasrice@proton.me | x!FoaK+vV%0z | client |
| reginaldmoss@proton.me | (t1GImiyT&bK | admin |
| laurenmitchell@proton.me | q@C#)bJw0c&0 | worker |
| scottroth@gmail.com | I6sT$1E9&zwW | admin |
| andrewphelps@proton.me | $*PPzUIyTm3L | company-manager |
| jennifergreene@proton.me | @0KDK0dV5A3R | admin |
| ericalvarez@gmail.com | w*!mXJfU$5lL | worker |
| markrocha@proton.me | !2niXpQVQ#Hi | company-manager |
| kristopherthomas@outlook.com | zVzCn_IA$zM8 | client |
| suevillegas@proton.me | _D7CltLghINI | admin |
| jonathanmccormick@proton.me | Q^0xGMSf#cr6 | worker |
| michellebecker@gmail.com | KH!Z8jBr!A74 | client |
| rachelglover@gmail.com | K%MaoHnxqq92 | client |
| andreadalton@icloud.com | f54KQpatBUg* | client |
| christinawilson@proton.me | S5Kp!(XV%zBp | admin |
| ruthadams@outlook.com | ge3ViJYY%T0G | company-manager |
| terrencesosa@icloud.com | T*Uz5ZpqWF+O | client |
| natalienorton@outlook.com | yFSAGYx@J(^7 | client |
| michellepeterson@proton.me | T*6GSTjg7qT3 | client |
| mariahudson@outlook.com | 2CKmm^enm+2( | admin |
| davidgreene@proton.me | K^uHV$&Rwd9D | admin |

### Auth Endpoints

| Method   | Path                           | Description |
|----------|--------------------------------|-------------|
| `POST`   | `/api/users/login`              | Login with email/password |
| `POST`   | `/api/users`                    | Create new account |
| `POST`   | `/api/users/refresh`            | Rotate refresh token |
| `POST`   | `/api/users/verify`             | Validate token |
| `POST`   | `/api/users/logout`             | Revoke refresh token |
| `POST`   | `/api/users/logout-all`         | Revoke all sessions |
| `GET`    | `/api/users/me`                 | Current user profile |
| `POST`   | `/api/users/forgot-password`    | Request reset email |
| `POST`   | `/api/users/forgot-password/:token` | Validate reset token |
| `POST`   | `/api/users/reset-password`     | Set new password |

### Status

| Method | Path            | Description        |
|--------|-----------------|--------------------|
| `GET`  | `/api/status`   | Health check       |
| `GET`  | `/docs`         | Swagger UI         |
| `GET`  | `/docs.json`    | OpenAPI spec (JSON)|

## License

ISC
