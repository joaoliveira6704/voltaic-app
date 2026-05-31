# Voltaic Data Generator

CLI tool to seed the Voltaic MongoDB with realistic test data — companies, station groups, users, charging stations, support tickets, usage logs, and an EV vehicle catalogue.

## Tech Stack

- Python 3.9+
- [Faker](https://github.com/joke2k/faker) — realistic fake data
- [PyMongo](https://pymongo.readthedocs.io/) — MongoDB driver
- [bcrypt](https://pypi.org/project/bcrypt/) — password hashing

## Setup

```bash
pip install -r requirements.txt
```

## Configuration

The MongoDB URI is read from the `MONGO_URI` environment variable. Copy `.env.example` to `.env` to override:

```
MONGO_URI="mongodb://root:root@localhost:27018/voltaic-db?authSource=admin"
```

## Usage

### Generate everything

```bash
python main.py --all
```

This generates and inserts:
- 5 station groups
- 10 companies
- 30 users
- 25 charging stations
- 40 tickets (mixed intervention + bug reports)
- 30 usage logs
- EV vehicle catalogue from `data/open-ev-data.json`

### Generate selectively with individual flags

```bash
# Only generate groups
python main.py --groups 5

# Generate companies (uses existing groups if available)
python main.py --companies 10

# Generate users with company assignments
python main.py --users 50

# Generate stations (requires existing groups + companies)
python main.py --stations 20

# Generate tickets by type
python main.py --tickets 30 --ticket-type intervention
python main.py --tickets 30 --ticket-type bug
python main.py --tickets 30 --ticket-type mixed   # default

# Generate usage logs
python main.py --usage 50

# Import EV vehicle data
python main.py --ev-data
```

### Drop collections before inserting

Add `--drop` to any command to clear the relevant collections first:

```bash
python main.py --all --drop
```

## CLI Reference

| Flag                | Type    | Default     | Description |
|---------------------|---------|-------------|-------------|
| `--all`             | flag    | —           | Generate everything with preset counts |
| `--groups`          | int     | `0`         | Number of station groups |
| `--companies`       | int     | `0`         | Number of companies |
| `--users`           | int     | `0`         | Number of users |
| `--stations`        | int     | `0`         | Number of charging stations |
| `--tickets`         | int     | `0`         | Number of support tickets |
| `--ticket-type`     | choice  | `mixed`     | Ticket category: `mixed`, `intervention`, `bug` |
| `--usage`           | int     | `0`         | Number of charging usage logs |
| `--ev-data`         | flag    | —           | Import EV catalogue from JSON |
| `--drop`            | flag    | —           | Drop collections before inserting |

Flags are composable. When running individual flags, the tool attempts to reuse existing data from the database as a base. For example, `--stations 10` will try to use existing groups and companies already in the DB.

## Generated Data

### Station Groups

5 groups are generated, each named after a city and a zone type (e.g. "Porto — North Zone"). Cities: Porto, Lisboa, Madrid, Faro, Sevilla.

### Companies

10 companies with unique names (e.g. "John Doe EV"). Each company is assigned 1–3 random groups.

### Users

30 users generated with:

| Field       | Description |
|-------------|-------------|
| `userId`    | UUID4 |
| `username`  | 8–20 character Faker username |
| `firstName` | Realistic first name |
| `lastName`  | Realistic last name |
| `email`     | Faker email |
| `password`  | Bcrypt-hashed (12 rounds) |
| `role`      | Random: `client`, `worker`, `company-manager`, `admin` |
| `companyId` | Assigned if role is not admin |
| `vehicles`  | 1–2 vehicles for client/worker roles |

Plaintext credentials are saved to `users.txt` in `email:password:role` format.

### Stations

25 stations distributed across groups. Each station includes:
- GeoPoint location within ~4km of the group's city centre
- 2–4 random socket types (`ccs1`, `ccs2`, `chademo`, `type1`, `type2`, `nacs`, etc.)
- Max power: 50kW, 150kW, or 350kW
- Telemetry: amperage (16/32/63A), voltage (230/400V), temperature
- State weighted toward `available` with some `maintenance` and `unavailable`

### Tickets

40 tickets, split roughly 70% intervention / 30% bug reports.

**Intervention templates** — 20 realistic scenarios with placeholders for station name, temperature, time, power, etc. Examples:
- "Connector Type2 not responding"
- "Station overheating — temperature above threshold"
- "Charging cable damaged — exposed wiring"
- "Ground fault detected — station auto-shutdown"

**Bug templates** — 15 software bug reports:
- "Dashboard chart not rendering on Safari"
- "Dark mode toggle not persisting across page reload"
- "Map markers overlapping at zoom level 14"

### Usage Logs

30 charging session records linking users (with vehicles) to stations.

### EV Vehicle Catalogue

Imported from `data/open-ev-data.json` into the `vehicles` collection. Skipped if the collection already has documents.

## Project Structure

```
data-gen/
├── main.py              Entry point — CLI parsing and orchestration
├── generator.py         Data generators using Faker (groups, companies, users, stations, tickets, usage)
├── models.py            Data classes: StationGroup, Company, User, Station, Ticket, StationUsage
├── db.py                MongoDB connection, CRUD helpers, insert/import logic
├── requirements.txt     Python dependencies
├── data/
│   └── open-ev-data.json    EV vehicle catalogue (make, model, year, charge ports)
└── users.txt            Generated credentials (gitignored)
```

## Docker

```bash
docker build -t voltaic-data-gen .
docker run --rm --network host --env-file .env voltaic-data-gen python main.py --all
```
