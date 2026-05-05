from db import insert_all, insert_ev_data
from generator import (
    generate_companies,
    generate_station_groups,
    generate_station_usage,
    generate_stations,
    generate_tickets,
    generate_users,
)

if __name__ == "__main__":
    print("🚀 Initializing EV Data Generation...")

    # 1. Foundation: Station Groups
    groups = generate_station_groups(count=5)

    # 2. Companies: Linked to Groups
    companies = generate_companies(count=10, groups=groups)

    # 3. Users: Linked to Companies
    users = generate_users(count=15, companies=companies)

    # 4. Stations: Linked to Companies and Groups
    stations = generate_stations(count=20, companies=companies, groups=groups)

    # 5. Activity: Tickets and Usage logs
    tickets = generate_tickets(count=20, users=users, stations=stations)
    usage = generate_station_usage(count=30, users=users, stations=stations)

    # 6. MongoDB Insertion
    # Update your db.py insert_all to accept (groups, companies, users, stations, tickets, usage)
    insert_all(groups, companies, users, stations, tickets, usage)

    # 7. Static Data
    try:
        insert_ev_data("./data/open-ev-data.json")
    except FileNotFoundError:
        print("⚠️  Warning: open-ev-data.json not found, skipping static data.")

    print("\n✅ All data successfully generated and stored in MongoDB.")
