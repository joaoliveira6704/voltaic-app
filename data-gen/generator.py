import math
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

# ~10 metres in degrees (at mid-latitudes, 1° lat ≈ 111 km → 10 m ≈ 0.00009°)
METRES_PER_DEGREE = 111_000
STATION_SPACING_M = 10
STATION_SPACING_DEG = STATION_SPACING_M / METRES_PER_DEGREE  # ≈ 0.00009°


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


def _offset_for_index(index: int) -> tuple[float, float]:
    """
    Return a (delta_lat, delta_lng) offset so that stations within the same
    group are placed ~STATION_SPACING_M metres apart, arranged in a grid.

    Layout (top-down view, each cell ≈ 10 m):
        0  1  2  3 …
        4  5  6  7 …
        …
    """
    cols = 4  # stations per row before wrapping
    row = index // cols
    col = index % cols
    delta_lat = row * STATION_SPACING_DEG
    delta_lng = col * STATION_SPACING_DEG
    return delta_lat, delta_lng


def generate_stations(count, companies, groups):
    """
    Stations are distributed evenly across groups. Within each group every
    station is offset ~10 m from the previous one, laid out on a grid
    originating from a city anchor point assigned to that group.
    """
    stations = []

    # Assign a fixed city anchor and company to each group
    group_anchors: dict[str, dict] = {}
    for group in groups:
        city = random.choice(CITIES)
        company = random.choice(companies)
        group_anchors[group.groupId] = {
            "city": city,
            "company": company,
            "station_count": 0,  # running index inside the group
        }

    # Distribute the requested station count round-robin across groups
    group_ids = [g.groupId for g in groups]

    for i in range(count):
        group_id = group_ids[i % len(group_ids)]
        anchor = group_anchors[group_id]

        base_lat, base_lng = anchor["city"]["coords"]
        idx = anchor["station_count"]
        delta_lat, delta_lng = _offset_for_index(idx)

        lat = base_lat + delta_lat
        lng = base_lng + delta_lng

        stations.append(
            Station(
                str(uuid.uuid4()),
                f"{anchor['city']['name']} Hub",
                anchor["company"].companyId,
                {
                    "type": "Point",
                    "coordinates": [lng, lat],  # GeoJSON: [lng, lat]
                },
                {
                    "socketTypes": random.sample(SOCKET_TYPES, 2),
                    "maxPower": random.choice([50, 150]),
                },
                {"amperage": 32, "voltage": 400, "temperature": 25.0},
                group_id,
                random.choice(["available", "maintenance"]),
            )
        )

        anchor["station_count"] += 1

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
