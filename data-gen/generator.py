import math
import random
import uuid
from datetime import datetime, timedelta, timezone
from concurrent.futures import ThreadPoolExecutor

import bcrypt
from faker import Faker
from models import Company, Station, StationGroup, StationUsage, Ticket, User

fake = Faker()

SOCKET_TYPES = [
    "ccs1",
    "ccs2",
    "chademo",
    "gb_t_ac",
    "gb_t_dc",
    "nacs",
    "type1",
    "type2",
]
CITIES = [
    {"name": "Porto", "coords": [41.1502, -8.6103]},
    {"name": "Lisboa", "coords": [38.7077, -9.1365]},
    {"name": "Madrid", "coords": [40.4167, -3.7035]},
    {"name": "Faro", "coords": [37.0194, -7.9322]},
    {"name": "Sevilla", "coords": [37.3891, -5.9845]},
]

METRES_PER_DEGREE = 111_000
MAX_RADIUS_M = 4

INTERVENTION_TEMPLATES = [
    {
        "title": "Connector Type2 not responding",
        "desc": "The Type2 connector at station {station} is not initiating charging sessions. Connector LED shows solid red. Cable latch mechanism feels stuck. Attempted reset via remote command — no change in status.",
    },
    {
        "title": "Station overheating — temperature above threshold",
        "desc": "Internal temperature sensor reading {temp}°C, exceeding the 45°C threshold. Cooling fan not audibly running. Station auto-throttled charging power to 50%. Immediate inspection required to prevent hardware damage.",
    },
    {
        "title": "Payment terminal offline",
        "desc": "Credit card reader on station {station} is unresponsive. NFC tag scanner also not working. Soft reboot did not restore connectivity. Error code E-422 displayed on screen. Users cannot start charging sessions.",
    },
    {
        "title": "Charging cable damaged — exposed wiring",
        "desc": "Customer reported visible damage to the CCS/SAE charging cable at station {station}. Outer sheath split approximately 15cm from connector head, exposing internal wiring. Station flagged as unavailable pending replacement.",
    },
    {
        "title": "Screen frozen on boot logo",
        "desc": "Display screen stuck on Voltaic boot logo. Touch input unresponsive. Underlying charging hardware appears functional (session can be started via mobile app). Hard power cycle required to restore display.",
    },
    {
        "title": "Charging session interrupted mid-cycle",
        "desc": "Multiple reports of charging sessions terminating abruptly after {min} minutes. No error code displayed. Vehicle reports 'Charging station communication lost'. Possibly related to firmware v3.2.1 regression.",
    },
    {
        "title": "RFID reader failure",
        "desc": "RFID card reader not detecting any cards. Cleaning the reader surface did not resolve. Internal log shows repeated 'Reader init failed' errors at startup. Affects all station access control.",
    },
    {
        "title": "Station network connectivity loss",
        "desc": "Station {station} has been offline for {hours} hours. No response to ping from central monitoring. LTE module indicator shows 'No Signal'. Last known good connection: {date} at {time}.",
    },
    {
        "title": "Ground fault detected — station auto-shutdown",
        "desc": "Ground fault monitoring system triggered automatic shutdown at station {station}. Differential current measured at {amp}mA (threshold: 30mA). Station locked out until electrical inspection is completed.",
    },
    {
        "title": "Connector latch broken — cable won't lock",
        "desc": "The mechanical latch on the CHAdeMO connector is broken, preventing the cable from locking into the vehicle port. Charging starts intermittently but stops if cable is jostled. Replacement connector head needed.",
    },
    {
        "title": "Billing discrepancy — session not invoiced",
        "desc": "Customer reported that charging session from {date} was not billed. Station log shows session completed successfully but no billing event was triggered. Backend API returned 500 during invoice generation.",
    },
    {
        "title": "Station firmware update failed",
        "desc": "Attempted OTA firmware update to version 4.1.0 failed at station {station}. Update process stalled at 73%. Station running on fallback firmware v3.2.0. Update service shows 'Device not responding'.",
    },
    {
        "title": "Emergency stop button triggered",
        "desc": "Emergency stop button was pressed at station {station}. Unable to determine if accidental or intentional. Station fully powered down. All three connectors offline. Manual reset required to restore service.",
    },
    {
        "title": "Charging power below expected rate",
        "desc": "Station {station} delivering only {power}kW instead of rated 150kW. Derating observed across all connectors. Power module temperature normal. Possible grid supply issue or PSU degradation.",
    },
    {
        "title": "Environmental sensor reporting incorrect data",
        "desc": "Ambient temperature sensor reading 10°C higher than actual. Rain sensor showing 'Wet' despite dry conditions. HVAC system responding to false readings, causing excessive cooling. Sensor calibration needed.",
    },
    {
        "title": "Station status not updating in mobile app",
        "desc": "Station {station} shows as 'Available' in mobile app but is physically in 'Maintenance' mode. Status sync issue between station and backend. Last successful heartbeat: {hours} hours ago.",
    },
    {
        "title": "Cable management arm broken",
        "desc": "The cable management support arm on the CCS connector is snapped at the pivot point. Cable hanging loose, posing trip hazard. Temporary fix with zip ties applied. Full replacement needed.",
    },
    {
        "title": "User authentication failing at station",
        "desc": "Users unable to authenticate via mobile app QR code scan at station {station}. 'Invalid token' error returned. Backend auth service logs show JWT signature mismatch. Key rotation may have caused this.",
    },
    {
        "title": "Station making unusual noise",
        "desc": "Audible grinding noise coming from cooling fan assembly at station {station}. Noise present continuously even when station idle. Possible bearing failure. Risk of fan seizure and overheating.",
    },
    {
        "title": "Plug-and-charge not working",
        "desc": "Plug-and-charge (ISO 15118) not functioning at station {station}. Vehicle connects but session does not auto-authorize. Manual authorization via mobile app works. EVSE certificate may have expired.",
    },
]

BUG_TEMPLATES = [
    {
        "title": "Dashboard chart not rendering on Safari",
        "desc": "The ticket status donut chart on the admin dashboard renders as a blank canvas in Safari 17.x. Works correctly in Chrome and Firefox. Console shows 'CanvasRenderingContext2D is null'. Regression from chart library update.",
    },
    {
        "title": "User search returns 500 on empty query",
        "desc": "Calling GET /api/users with no query parameters or an empty string returns HTTP 500. Expected: return all users (paginated) or a 400 validation error. Stack trace points to null pointer in query builder middleware.",
    },
    {
        "title": "Login page layout broken on mobile viewport",
        "desc": "Login page form elements overflow viewport on screens narrower than 360px. Submit button hidden below fold. Input fields have incorrect padding on iOS Safari. Media query for small screens missing.",
    },
    {
        "title": "Email notifications not sending after password reset",
        "desc": "Password reset flow completes successfully but notification email is never delivered. SMTP logs show 'Connection refused' to mail server. Environment variable SMTP_HOST is empty in production config.",
    },
    {
        "title": "Station list pagination off by one",
        "desc": "Admin station list shows 'Page 1 of X' where X is always one more than actual pages. Total count includes the current page offset. Math.ceil vs Math.floor bug in pagination helper.",
    },
    {
        "title": "Dark mode toggle not persisting across page reload",
        "desc": "User preference for dark mode is applied immediately but resets to light mode on page refresh. Cookie/localStorage write fails silently. Color mode composable not awaiting promise before setting preference.",
    },
    {
        "title": "CSV export generates malformed file for stations with special chars",
        "desc": "Station names containing commas or quotes produce malformed CSV on export. Fields not properly escaped. Excel opens file with columns shifted. Need to wrap fields in quotes and escape inner quotes.",
    },
    {
        "title": "Session timeout not redirecting to login",
        "desc": "When JWT token expires during active session, API calls fail with 401 but user remains on current page with broken UI. No redirect to /login. Auth middleware not triggering client-side navigation.",
    },
    {
        "title": "Vehicle selection dropdown extremely slow with many vehicles",
        "desc": "The vehicle model select in 'Add Vehicle' modal takes 8+ seconds to open when vehicle database has >500 entries. No virtualization or debounced search. All 1,189 EV models loaded at once into DOM.",
    },
    {
        "title": "Form validation errors not showing for station creation",
        "desc": "Required fields in 'Register New Station' modal do not show validation errors on submit. Form submits silently to API, which returns 400, but error message is not displayed to user. Missing error state binding.",
    },
    {
        "title": "Map markers overlapping at zoom level 14",
        "desc": "Stations within 100m of each other have overlapping map markers at zoom level 14 and below. No marker clustering implemented. Markers become unclickable because they render beneath adjacent markers.",
    },
    {
        "title": "International phone numbers rejected in user profile",
        "desc": "Phone number input field in Edit Profile rejects valid international numbers. Regex validator only accepts US/PT format. Users from Spain cannot save their profile with a +34 number.",
    },
    {
        "title": "WebSocket connection dropping after 5 minutes of inactivity",
        "desc": "Real-time station status updates stop working after ~5 minutes of page inactivity. WebSocket server terminates idle connections. No reconnection logic in client — requires manual page refresh.",
    },
    {
        "title": "Admin cannot delete user with active charging sessions",
        "desc": "DELETE /api/users/:id returns 500 when user has active charging sessions. No foreign key check before deletion. Error: 'Cannot delete user due to existing references in usages collection'.",
    },
    {
        "title": "Station telemetry data not updating in real-time",
        "desc": "The station detail page telemetry cards (amperage, voltage, temperature) show stale data. Polling interval stops after component unmounts and does not resume on re-mount. useInterval not cleaned up properly.",
    },
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
    assigned_cities = random.sample(CITIES, min(count, len(CITIES)))
    for i in range(count):
        city = assigned_cities[i % len(assigned_cities)]
        groups.append(
            StationGroup(
                str(uuid.uuid4()),
                f"{city['name']} — {random.choice(names)}",
            )
        )
    return groups


def generate_companies(count, groups):
    companies = []
    group_ids = [g.groupId for g in groups]
    for _ in range(count):
        assigned_groups = random.sample(group_ids, k=random.randint(1, min(3, len(group_ids))))
        companies.append(
            Company(str(uuid.uuid4()), f"{fake.company()} EV", assigned_groups)
        )
    return companies


def generate_users(count, companies=None, outpath="users.txt"):
    users = []
    company_ids = [c.companyId for c in companies] if companies else []
    raw_pwds = [fake.password(length=12) for _ in range(count)]

    with ThreadPoolExecutor() as executor:
        hashed_pwds = list(executor.map(_hash_password, raw_pwds))

    used_usernames = set()
    used_emails = set()
    lines = []
    email_domains = ["gmail.com", "outlook.com", "icloud.com", "proton.me"]
    for i in range(count):
        role = random.choice(["client", "worker", "company-manager", "admin"])
        comp_id = random.choice(company_ids) if role != "admin" and company_ids else None

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

        first_name = fake.first_name()
        last_name = fake.last_name()
        base_key = f"{first_name.lower()}.{last_name.lower()}".translate(
            str.maketrans("", "", " .,'-$")
        )[:24]

        username = base_key
        while username in used_usernames or len(username) < 6:
            username = f"{base_key[:18]}{random.randint(10, 99)}"
        used_usernames.add(username)

        email = f"{base_key}@{random.choice(email_domains)}"
        while email in used_emails:
            email = f"{base_key}.{random.randint(10, 99)}@{random.choice(email_domains)}"
        used_emails.add(email)
        lines.append(f"{email}:{raw_pwds[i]}:{role}")

        users.append(
            User(
                str(uuid.uuid4()),
                username,
                first_name,
                last_name,
                email,
                hashed_pwds[i],
                role,
                comp_id,
                vehicles,
            )
        )

    with open(outpath, "w") as f:
        
        f.write("\n".join(lines) + "\n")
    print(f"  📝 Saved {len(lines)} user credentials to {outpath}")
    return users


def _random_point_in_radius(center_lat, center_lng, radius_m):
    angle = random.uniform(0, 2 * math.pi)
    radius_m_actual = random.uniform(0, radius_m)
    lat_rad = math.radians(center_lat)
    delta_lat = (radius_m_actual / METRES_PER_DEGREE) * math.cos(angle)
    delta_lng = (radius_m_actual / METRES_PER_DEGREE) * math.sin(angle) / math.cos(lat_rad)
    return center_lat + delta_lat, center_lng + delta_lng


def generate_stations(count, companies, groups):
    stations = []

    group_configs: dict[str, dict] = {}
    assigned_cities = random.sample(
        CITIES, min(len(groups), len(CITIES))
    )
    for idx, group in enumerate(groups):
        city = assigned_cities[idx % len(assigned_cities)]
        company = random.choice(companies)
        jitter_lat = random.uniform(-0.0002, 0.0002)
        jitter_lng = random.uniform(-0.0002, 0.0002)
        center_lat = city["coords"][0] + jitter_lat
        center_lng = city["coords"][1] + jitter_lng
        group_configs[group.groupId] = {
            "city": city,
            "company": company,
            "center": (center_lat, center_lng),
        }

    group_ids = [g.groupId for g in groups]
    base_names = ["Hub", "Plaza", "Station", "Point", "Spot", "Garage", "Depot"]

    for i in range(count):
        group_id = group_ids[i % len(group_ids)]
        cfg = group_configs[group_id]
        base_lat, base_lng = cfg["center"]

        lat, lng = _random_point_in_radius(base_lat, base_lng, MAX_RADIUS_M)

        stations.append(
            Station(
                str(uuid.uuid4()),
                f"{cfg['city']['name']} {random.choice(base_names)} {i + 1}",
                group_id,
                {
                    "type": "Point",
                    "coordinates": [lng, lat],
                },
                {
                    "socketTypes": random.sample(SOCKET_TYPES, random.randint(2, 4)),
                    "maxPower": random.choice([50, 150, 350]),
                },
                {
                    "amperage": random.choice([16, 32, 63]),
                    "voltage": random.choice([230, 400]),
                    "temperature": round(random.uniform(22, 48), 1),
                },
                random.choices(
                    ["available", "available", "available", "maintenance", "unavailable"],
                    weights=[50, 20, 15, 10, 5],
                )[0],
            )
        )

    return stations


def _build_intervention_ticket(users, stations):
    user = random.choice([u for u in users if u.role in ("worker", "company-manager")] or users)
    station = random.choice(stations)
    template = random.choice(INTERVENTION_TEMPLATES)
    title = template["title"]
    description = template["desc"].format(
        station=station.title,
        temp=random.randint(42, 72),
        min=random.randint(5, 30),
        hours=random.randint(2, 48),
        date=fake.date(),
        time=fake.time(),
        amp=random.randint(35, 120),
        power=random.choice([22, 35, 48, 60, 75]),
    )
    status = random.choices(
        ["open", "open", "open", "resolved", "unresolved"],
        weights=[40, 20, 10, 20, 10],
    )[0]
    remarks = random.choices(
        [None, "Investigation in progress", "Waiting for replacement part",
         "Escalated to senior technician", "Remote diagnostics initiated",
         "Scheduled for maintenance tomorrow", "Resolved — firmware updated"], 
        weights=[40, 10, 10, 10, 10, 10, 10],
    )[0]

    return Ticket(
        str(uuid.uuid4()),
        station.stationId,
        user.userId,
        title,
        description,
        status,
        remarks,
        closedAt=fake.date_time_this_month() if status == "closed" else None,
        companyId=user.companyId,
    )


def _build_bug_ticket(users):
    admins = [u for u in users if u.role == "admin"]
    if not admins:
        return None
    user = random.choice(admins)
    template = random.choice(BUG_TEMPLATES)
    status = random.choices(
        ["open", "open", "resolved", "unresolved", "closed"],
        weights=[30, 20, 20, 20, 10],
    )[0]

    return Ticket(
        str(uuid.uuid4()),
        None,
        user.userId,
        template["title"],
        template["desc"],
        status,
        random.choice([None, "Reported by customer support", "Reproduced in staging",
                       "Assigned to dev team", "Needs prioritization", None, None]),
        closedAt=fake.date_time_this_month() if status == "closed" else None,
        companyId=None,
    )


def generate_tickets(count, users, stations, ticket_type="mixed"):
    tickets = []
    attempts = 0

    while len(tickets) < count and attempts < count * 5:
        attempts += 1

        if ticket_type == "bug":
            t = _build_bug_ticket(users)
            if t:
                tickets.append(t)
        elif ticket_type == "intervention":
            t = _build_intervention_ticket(users, stations)
            if t:
                tickets.append(t)
        else:
            if random.random() < 0.3:
                t = _build_bug_ticket(users)
            else:
                t = _build_intervention_ticket(users, stations)
            if t:
                tickets.append(t)

    return tickets


def _random_past_datetime(max_days_back=90):
    return datetime.now(timezone.utc) - timedelta(
        days=random.randint(0, max_days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )

def generate_station_usage(count, users, stations):
    clients = [u for u in users if u.vehicles]
    if not clients:
        return []
    return [
        StationUsage(
            str(uuid.uuid4()),
            random.choice(clients).userId,
            random.choice(stations).stationId,
            random.choice(clients).vehicles[0]["plate"],
            endTime=(created_at := _random_past_datetime()) + timedelta(minutes=random.randint(30, 360)),
            state="completed",
            createdAt=created_at,
        )
        for _ in range(count)
    ]
