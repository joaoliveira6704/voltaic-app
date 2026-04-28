# Voltaic Data Generator

Seed script for the **Voltaic** EV charging platform. Generates realistic fake data for companies, users, stations, and support tickets, then inserts everything into MongoDB.

---

## Project Structure

```
.
├── generator.py          # Data model definitions and faker-based generators
├── db.py                 # MongoDB connection and insertion helpers
├── main.py               # Entry point — orchestrates generation and insertion
├── data/
│   └── open-ev-data.json # External EV vehicle dataset
├── users.txt             # Auto-generated plaintext credentials (email:password:role)
└── requirements.txt # Python Package Dependencies
```

---

## Prerequisites

- Python 3.9+
- A running MongoDB instance (default: `localhost:27018`)
- The following Python packages:

```bash
pip install -r requirements.txt
```

OR Manually:

```bash
pip install faker pymongo bcrypt
```

---

## Configuration

The MongoDB connection string is read from the environment variable `MONGO_URI`. If not set, it falls back to:

```
mongodb://root:root@localhost:27018/voltaic-db?authSource=admin
```

To override:

```bash
export MONGO_URI="mongodb://user:pass@host:port/voltaic-db?authSource=admin"
```

---

## Usage

```bash
python3 main.py
```

This will:

1. Generate **10 companies** across Porto, Lisboa, Madrid, Faro, and Sevilla
2. Generate **100 users** with bcrypt-hashed passwords (roles: `client`, `worker`, `company-manager`, `admin`)
3. Generate **20 charging stations** with random connectors, telemetry, and states
4. Generate **20 support tickets** linked to users and stations
5. Insert all of the above into MongoDB (`voltaic-db`)
6. Import EV vehicle data from `data/open-ev-data.json` into the `vehicles` collection

Plaintext credentials are saved to `users.txt` in `email:password:role` format for testing.

---

## Generated Collections

### `companies`

| Field         | Description                         |
| ------------- | ----------------------------------- |
| `companyId`   | UUID                                |
| `name`        | Faker company name + "EV Solutions" |
| `workingArea` | GeoJSON Point near a seeded city    |

### `users`

| Field       | Description                                       |
| ----------- | ------------------------------------------------- |
| `userId`    | UUID                                              |
| `username`  | Derived from first/last name + random suffix      |
| `email`     | Faker email                                       |
| `password`  | bcrypt hash (12 rounds)                           |
| `role`      | `client`, `worker`, `company-manager`, or `admin` |
| `companyId` | Set for `worker` and `company-manager` roles      |
| `vehicles`  | 1–3 vehicles for `client` and `worker` roles      |
| `favorites` | Empty list (populated by app logic)               |

### `stations`

| Field                   | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `stationId`             | UUID                                                           |
| `title`                 | City name + random index                                       |
| `location`              | GeoJSON Point                                                  |
| `connector.socketTypes` | 1–3 types from a fixed list (e.g. `CCS/SAE`, `Type2`, `Tesla`) |
| `connector.maxPower`    | kW (7.4 – 350)                                                 |
| `telemetry`             | Amperage, voltage, temperature                                 |
| `state`                 | `available`, `unavailable`, or `inactive`                      |
| `alive`                 | `false` only when state is `inactive`                          |

### `tickets`

| Field       | Description                                     |
| ----------- | ----------------------------------------------- |
| `ticketId`  | UUID                                            |
| `createdBy` | Random user ID                                  |
| `stationId` | Random station ID                               |
| `title`     | One of 10 predefined issue types                |
| `status`    | `open`, `closed`, `resolved`, or `unresolved`   |
| `remarks`   | Optional (40% chance of being set)              |
| `closedAt`  | ISO timestamp, only set when status is `closed` |

### `vehicles`

Imported as-is from `data/open-ev-data.json`. Structure depends on the source file.

---

## Supported Socket Types

`Type2`, `CHAdeMO`, `CCS/SAE`, `Type3`, `Tesla`, `J-1772`, `Wall_Euro`, `Caravan_Mains_Socket`, `Dual_J-1772`, `Dual_CHAdeMO`, `Mennekes`, `Dual_Mennekes`, `Other`

---

## Seeded Cities

| City    | Country  |
| ------- | -------- |
| Porto   | Portugal |
| Lisboa  | Portugal |
| Faro    | Portugal |
| Madrid  | Spain    |
| Sevilla | Spain    |

Station and company coordinates are randomly jittered within ±0.5° of each city center.

---

## Notes

- Password hashing runs in parallel using `ThreadPoolExecutor` to speed up large user counts.
- `users.txt` is overwritten on every run — back it up if needed.
- Re-running the script will append duplicate documents to MongoDB. Drop the collections first if you need a clean seed:

```js
// MongoDB shell
use voltaic-db
db.companies.drop()
db.users.drop()
db.stations.drop()
db.tickets.drop()
db.vehicles.drop()
```
