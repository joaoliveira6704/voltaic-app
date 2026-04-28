# Voltaic

Full-stack platform for managing EV charging infrastructure. Includes a REST API, a frontend client, and a data generation toolset for seeding the database.

---

## Monorepo Structure

```
voltaic-app/
├── api/                  # Node.js/Bun REST API
│   ├── src/
│   ├── tests/
│   ├── app.js
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
│
├── data-gen/             # Python seed data generator
│   ├── data/             # External datasets (e.g. open-ev-data.json)
│   ├── generator.py      # Faker-based model generators
│   ├── db.py             # MongoDB insertion helpers
│   ├── main.py           # Entry point
│   └── requirements.txt
│
├── frontend/             # Frontend Service
│   ├── app/
│   ├── plugins/
│   ├── public/
│   ├── bun.lock
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── nuxt.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tailwind.config.cjs
│   ├── tsconfig.json
│   ├── .env
│   └── .env.example
│
├── .env.example          # Environment variables
├── compose.yaml          # Docker Compose — full stack
└── Makefile              # Convenience commands
```

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Bun](https://bun.sh/) (for local API development) or [Node.js](https://nodejs.org/en/)
- Python 3.9+ (for local data-gen development)

---

## Getting Started

### Run the full project with one command

On mac:

- If you use bun:

```bash
make mac-bun-dev
```

- If you use node:

```bash
make mac-node-dev
```

On windows:

- If you use bun:

```bash
make win-bun-dev
```

- If you use node:

```bash
make win-node-dev
```

### Run the full stack with Docker

```bash
docker compose up --build
```

This starts MongoDB, the API, and a Mongo Express instance.

### Stop and clean up

```bash
docker compose down -v
```

---

## Services

### API — `api/`

Node.js/Bun REST API serving the Voltaic backend.

```bash
cd api
cp .env.example .env
bun install
bun run app.js
```

Configure via `api/.env`. See `api/.env.example` for available variables.

### Frontend — `frontend/`

```bash
cd frontend
cp .env.example .env
```

Refer to `frontend/.env.example` for required environment variables.

### Data Generator — `data-gen/`

Seeds MongoDB with companies, users, stations, tickets, and EV vehicle data.

```bash
cd data-gen
pip install -r requirements.txt
cp .env.example .env
python main.py
```

See [`data-gen/README.md`](data-gen/README.md) for full documentation on generated collections and configuration.

---

## Makefile

Common tasks are available via `make`. Run `make help` (or just `make`) to list available targets.

---

## Environment Variables

Each service has its own `.env.example` file at its root. Copy it to `.env` and fill in the values before running locally.

| Service  | File                    |
| -------- | ----------------------- |
| Docker   | `.env.example`          |
| API      | `api/.env.example`      |
| Frontend | `frontend/.env.example` |
| Data Gen | `data-gen/.env.example` |

---

## Contributing

1. Create a branch from `develop`
2. Make your changes
3. Open a pull request — CI runs via `.github/`
