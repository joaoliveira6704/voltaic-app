import random
import uuid
from concurrent.futures import ThreadPoolExecutor

import bcrypt
from faker import Faker
from models import Company, Station, StationGroup, StationUsage, Ticket, User

fake = Faker()

SOCKET_TYPES = [
    "Type2",
    "CHAdeMO",
    "CCS/SAE",
    "Tesla",
    "J-1772",
    "Mennekes",
    "Wall_Euro",
]
CITIES = [
    {"name": "Porto", "coords": [41.1502, -8.6103]},
    {"name": "Lisboa", "coords": [38.7077, -9.1365]},
    {"name": "Madrid", "coords": [40.4167, -3.7035]},
]


def _hash_password(pwd):
    return bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")

def generate_station_groups(count=5):
    groups = []
    names = [
        "North Zone",
        "South Zone",
        "Fast Charge Hub",
        "Retail Network",
        "Corporate Park",
    ]
    for i in range(count):
        groups.append(
            StationGroup(str(uuid.uuid4()), random.choice(names) + f" {i + 1}")
        )
    return groups


def generate_companies(count, groups):
    companies = []
    group_ids = [g.groupId for g in groups]
    for _ in range(count):
        assigned_groups = random.sample(group_ids, k=random.randint(1, 3))
        companies.append(
            Company(str(uuid.uuid4()), f"{fake.company()} EV", assigned_groups)
        )
    return companies


def generate_users(count, companies):
    users = []
    company_ids = [c.companyId for c in companies]
    raw_pwds = [fake.password(length=12) for _ in range(count)]

    with ThreadPoolExecutor() as executor:
        hashed_pwds = list(executor.map(_hash_password, raw_pwds))

    for i in range(count):
        role = random.choice(["client", "worker", "company-manager", "admin"])
        comp_id = random.choice(company_ids) if role != "admin" else None

        vehicles = []
        if role in ["client", "worker"]:
            for _ in range(random.randint(1, 2)):
                vehicles.append(
                    {
                        "plate": fake.license_plate(),
                        "model": fake.word().capitalize(),
                        "color": fake.color_name(),
                        "slug": fake.slug(),
                        "connector": random.choice(SOCKET_TYPES),
                    }
                )

        users.append(
            User(
                str(uuid.uuid4()),
                fake.user_name()[:20],
                fake.first_name(),
                fake.last_name(),
                fake.email(),
                hashed_pwds[i],
                role,
                comp_id,
                vehicles,
            )
        )
    return users


def generate_stations(count, companies, groups):
    stations = []
    group_ids = [g.groupId for g in groups]
    for _ in range(count):
        city = random.choice(CITIES)
        stations.append(
            Station(
                str(uuid.uuid4()),
                f"{city['name']} Hub",
                random.choice(companies).companyId,
                {
                    "type": "Point",
                    "coordinates": [city["coords"][1], city["coords"][0]],
                },
                {
                    "socketTypes": random.sample(SOCKET_TYPES, 2),
                    "maxPower": random.choice([50, 150]),
                },
                {"amperage": 32, "voltage": 400, "temperature": 25.0},
                random.choice(group_ids),
                random.choice(["available", "maintenance"]),
            )
        )
    return stations


def generate_tickets(count, users, stations):
    return [
        Ticket(
            str(uuid.uuid4()),
            random.choice(stations).stationId,
            random.choice(users).userId,
            fake.sentence(nb_words=3),
            fake.text(),
        )
        for _ in range(count)
    ]


def generate_station_usage(count, users, stations):
    clients = [u for u in users if u.vehicles]
    return [
        StationUsage(
            str(uuid.uuid4()),
            random.choice(clients).userId,
            random.choice(stations).stationId,
            random.choice(clients).vehicles[0]["plate"],
        )
        for _ in range(count)
    ]
