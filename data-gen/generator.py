from faker import Faker
import uuid
import random
import bcrypt

from concurrent.futures import ThreadPoolExecutor, as_completed

fake = Faker()

SOCKET_TYPES = [
    "Type2", "CHAdeMO", "CCS/SAE", "Type3", "Tesla", "J-1772",
    "Wall_Euro", "Caravan_Mains_Socket", "Dual_J-1772", "Dual_CHAdeMO",
    "Mennekes", "Dual_Mennekes", "Other"
]

CITIES = [
    {"name": "Porto",      "coords": [41.1502195, -8.6103497]},
    {"name": "Lisboa",   "coords": [38.7077507, -9.1365919]},
    {"name": "Madrid",       "coords": [40.416782, -3.703507]},
    {"name": "Faro",       "coords": [37.0162944, -7.935182]},
    {"name": "Sevilla",       "coords": [37.3886303, -5.9953403]},
]

# ── Models ────────────────────────────────────────────────────────────────────

class User:
    def __init__(self, userId, username, firstName, lastName, email, password, role, companyId, vehicles, favorites):
        """ role: "client" | "worker" | "company-manager" | "admin" """
        self.userId = userId
        self.username = username
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.password = password
        self.role = role
        self.companyId = companyId
        self.vehicles = vehicles
        self.favorites = favorites

class Station:
    def __init__(self, stationId, title, location, connector, telemetry, state="available", alive=True):
        """ state: "available" | "unavailable" | "inactive" """
        self.stationId = stationId
        self.title = title
        self.location = location          # { "type": "Point", "coordinates": [longitude, latitude] }
        self.connector = connector        # { "socketTypes": [...], "maxPower": float }
        self.telemetry = telemetry        # { "amperage": float, "voltage": float, "temperature": float }
        self.state = state                # "available" | "unavailable" | "inactive"
        self.alive = alive

class Company:
    def __init__(self, companyId, name, workingArea):
        """ workingArea: { "type": "Point", "coordinates": [longitude, latitude] } """
        self.companyId = companyId
        self.name = name
        self.workingArea = workingArea    # { "type": "Point", "coordinates": [longitude, latitude] }

class Ticket:
    def __init__(self, ticketId, createdBy, stationId, title, description, remarks, status):
        """ status: "open" | "closed" | "resolved" | "unresolved" """
        self.ticketId = ticketId
        self.createdBy = createdBy
        self.stationId = stationId
        self.title = title
        self.description = description
        self.remarks = remarks
        self.status = status              # "open" | "closed" | "resolved" | "unresolved"
        self.closedAt = None

# ── Helpers ───────────────────────────────────────────────────────────────────

def _random_coords(base_coords: list, radius: float = 0.5) -> list:
    """Jitter coordinates slightly around a base point."""
    lng = base_coords[0] + random.uniform(-radius, radius)
    lat = base_coords[1] + random.uniform(-radius, radius)
    return [round(lng, 6), round(lat, 6)]

def _generate_vehicle() -> dict:
    """ Generate a random vehicle with realistic attributes. """
    connector = fake.random_element(elements=SOCKET_TYPES)
    return {
        "plate": fake.license_plate(),
        "model": f"{fake.random_element(['Tesla', 'Nissan', 'BMW', 'Audi', 'Hyundai', 'Kia', 'Chevrolet', 'Ford'])} "
                 f"{fake.random_element(['Model 3', 'Leaf', 'i3', 'e-tron', 'Ioniq', 'EV6', 'Bolt', 'Mustang Mach-E'])}",
        "color": fake.color_name(),
        "connector": connector,
    }

# ── Generators ────────────────────────────────────────────────────────────────

def generate_companies(count: int = 10) -> list:
    """ Generate a list of companies with random names and working areas. """
    companies = []

    for i in range(count):
        city = fake.random_element(elements=CITIES)
        company_id = str(uuid.uuid4())
        name = f"{fake.company()} EV Solutions"
        working_area = {
            "type": "Point",
            "coordinates": _random_coords(city["coords"]),
        }

        company = Company(company_id, name, working_area)
        companies.append(company)
        print(f"Company {i+1}: {name} ({city['name']})")

    print("Companies created successfully\n")
    return companies

def _hash_password(raw_password: str) -> str:
    """ Hash a raw password using bcrypt. """
    return bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")

def generate_users(count: int = 20, companies: list = None) -> list:
    """ Generate a list of users with random attributes. """
    users = []
    rawUsers = []
    company_ids = [c.companyId for c in companies] if companies else []

    # Build raw user data first (fast)
    raw_data = []
    for i in range(count):
        # Generate realistic user attributes
        firstName = fake.first_name()
        lastName = fake.last_name()
        username = f"{firstName.lower()}{lastName.lower()}{fake.random_int(min=10, max=99)}"
        email = f"{firstName.lower()}.{lastName.lower()}@{fake.free_email_domain()}"
        raw_password = fake.password(length=12)
        user_id = str(uuid.uuid4())
        role = fake.random_element(elements=("client", "client", "client", "worker", "company-manager", "admin"))
        company_id = None
        if role in ("worker", "company-manager") and company_ids:
            company_id = fake.random_element(elements=company_ids)
        vehicles = []
        if role in ("client", "worker"):
            vehicle_count = fake.random_int(min=1, max=3)
            vehicles = [_generate_vehicle() for _ in range(vehicle_count)]
        raw_data.append((user_id, username, firstName, lastName, email, raw_password, role, company_id, vehicles))

    # Hash all passwords in parallel
    with ThreadPoolExecutor() as executor:
        futures = {executor.submit(_hash_password, d[5]): i for i, d in enumerate(raw_data)}
        hashed = [None] * count
        for future in as_completed(futures):
            hashed[futures[future]] = future.result()

    # Assemble users
    for i, (user_id, username, firstName, lastName, email, raw_password, role, company_id, vehicles) in enumerate(raw_data):
        password = hashed[i]
        user = User(user_id, username, firstName, lastName, email, password, role, company_id, vehicles, [])
        users.append(user)
        print(f"User {i+1}: {firstName} {lastName} ({username}) | role: {role}"
              + (f" | company: {company_id}" if company_id else ""))
        rawUsers.append((email, raw_password, role))

    # Save raw user credentials to a file for testing purposes
    with open("users.txt", "w") as f:
        for email, password, role in rawUsers:
            f.write(f"{email}:{password}:{role}\n")

    print("Users created successfully\n")
    return users

def generate_stations(count: int = 20) -> list:
    """ Generate a list of stations with random attributes. """
    stations = []

    for i in range(count):
        city = fake.random_element(elements=CITIES)
        station_id = str(uuid.uuid4())
        title = f"{city['name']} Charging Station {fake.random_int(min=1, max=999)}"
        location = {
            "type": "Point",
            "coordinates": _random_coords(city["coords"]),
        }
        connector = {
            "socketTypes": fake.random_elements(elements=SOCKET_TYPES, length=fake.random_int(min=1, max=3), unique=True),
            "maxPower": fake.random_element(elements=[7.4, 11, 22, 50, 100, 150, 250, 350]),
        }
        telemetry = {
            "amperage": round(fake.pyfloat(min_value=0, max_value=100), 2),
            "voltage": fake.random_element(elements=[120, 230, 400, 480]),
            "temperature": round(fake.pyfloat(min_value=-10, max_value=60), 1),
        }
        state = fake.random_element(elements=("available", "available", "available", "unavailable", "inactive"))
        alive = state != "inactive"

        station = Station(station_id, title, location, connector, telemetry, state, alive)
        stations.append(station)
        print(f"Station {i+1}: {title} | state: {state} | maxPower: {connector['maxPower']}kW")

    print("Stations created successfully\n")
    return stations

def generate_tickets(count: int = 20, users: list = None, stations: list = None) -> list:
    """ Generate a list of tickets with random attributes. """
    tickets = []
    user_ids = [u.userId for u in users] if users else [str(uuid.uuid4())]
    station_ids = [s.stationId for s in stations] if stations else [str(uuid.uuid4())]

    issues = [
        "Station not responding", "Connector damaged", "Payment failure",
        "Charging too slow", "Screen not working", "Cable stuck",
        "Station offline", "Error code displayed", "Billing issue", "App not connecting",
    ]

    # Generate tickets with realistic attributes
    for i in range(count):
        ticket_id = str(uuid.uuid4())
        created_by = fake.random_element(elements=user_ids)
        station_id = fake.random_element(elements=station_ids)
        title = fake.random_element(elements=issues)
        description = fake.paragraph(nb_sentences=2)
        remarks = fake.sentence() if fake.boolean(chance_of_getting_true=40) else None
        status = fake.random_element(elements=("open", "open", "closed", "resolved", "unresolved"))

        ticket = Ticket(ticket_id, created_by, station_id, title, description, remarks, status)

        if status == "closed":
            ticket.closedAt = fake.date_time_this_year().isoformat()

        tickets.append(ticket)
        print(f"Ticket {i+1}: [{status.upper()}] {title}")

    print("Tickets created successfully\n")
    return tickets