import argparse
import os

from db import (
    drop_collections,
    get_companies,
    get_db,
    get_groups,
    get_stations,
    get_users,
    insert_all,
    insert_ev_data,
)
from generator import (
    generate_companies,
    generate_station_groups,
    generate_station_usage,
    generate_stations,
    generate_tickets,
    generate_users,
)
from models import Company, Station, StationGroup, User


def cli():
    parser = argparse.ArgumentParser(description="Voltaic EV Data Generator")
    parser.add_argument("--all", action="store_true", help="Generate everything")
    parser.add_argument("--groups", type=int, default=0, help="Generate station groups")
    parser.add_argument("--companies", type=int, default=0, help="Generate companies")
    parser.add_argument("--users", type=int, default=0, help="Generate users")
    parser.add_argument("--stations", type=int, default=0, help="Generate stations")
    parser.add_argument("--tickets", type=int, default=0, help="Generate tickets")
    parser.add_argument(
        "--ticket-type",
        choices=["mixed", "intervention", "bug"],
        default="mixed",
        help="Type of tickets to generate (default: mixed)",
    )
    parser.add_argument("--usage", type=int, default=0, help="Generate station usage logs")
    parser.add_argument("--ev-data", action="store_true", help="Import EV vehicle data")
    parser.add_argument(
        "--drop",
        action="store_true",
        help="Drop collections before inserting",
    )

    return parser.parse_args()


def resolve(args):
    db = get_db()

    ref_groups = []
    ref_companies = []
    ref_users = []
    ref_stations = []

    new_groups = []
    new_companies = []
    new_users = []
    new_stations = []
    new_tickets = []
    new_usage = []

    if args.all:
        drop_before = ["groups", "companies", "users", "stations", "tickets", "usages"]
        if args.drop:
            drop_collections(db, drop_before)

        COUNT_GROUPS = 5
        COUNT_COMPANIES = 10
        COUNT_USERS = 30
        COUNT_STATIONS = 25
        COUNT_TICKETS = 40
        COUNT_USAGE = 30

        new_groups = generate_station_groups(count=COUNT_GROUPS)
        new_companies = generate_companies(count=COUNT_COMPANIES, groups=new_groups)
        new_users = generate_users(count=COUNT_USERS, companies=new_companies)
        new_stations = generate_stations(count=COUNT_STATIONS, companies=new_companies, groups=new_groups)
        new_tickets = generate_tickets(
            count=COUNT_TICKETS, users=new_users, stations=new_stations, ticket_type="mixed"
        )
        new_usage = generate_station_usage(count=COUNT_USAGE, users=new_users, stations=new_stations)

        print(f"\n📋 Generated: {COUNT_GROUPS} groups, {COUNT_COMPANIES} companies, "
              f"{COUNT_USERS} users, {COUNT_STATIONS} stations, "
              f"{COUNT_TICKETS} tickets, {COUNT_USAGE} usage logs")

    else:
        if args.groups or args.companies or args.users or args.stations or args.tickets or args.usage:
            if args.drop:
                to_drop = []
                if args.groups: to_drop.append("groups")
                if args.companies: to_drop.append("companies")
                if args.users: to_drop.append("users")
                if args.stations: to_drop.append("stations")
                if args.tickets: to_drop.append("tickets")
                if args.usage: to_drop.append("usages")
                if to_drop:
                    drop_collections(db, to_drop)

        if args.groups:
            new_groups = generate_station_groups(count=args.groups)
            ref_groups = new_groups
            print(f"  📍 Generated {len(new_groups)} groups")
        else:
            existing_groups = get_groups(db)
            for g in existing_groups:
                ref_groups.append(StationGroup(g["groupId"], g["name"]))
            print(f"  📍 Using {len(ref_groups)} existing groups" if ref_groups else "  ⚠️  No existing groups found")

        if args.companies:
            new_companies = generate_companies(count=args.companies, groups=ref_groups or None)
            ref_companies = new_companies
            print(f"  🏢 Generated {len(new_companies)} companies")
        else:
            existing_companies = get_companies(db)
            for c in existing_companies:
                ref_companies.append(Company(c["companyId"], c["name"], c.get("groups", [])))
            print(f"  🏢 Using {len(ref_companies)} existing companies" if ref_companies else "  ⚠️  No existing companies found")

        if args.users:
            new_users = generate_users(count=args.users, companies=ref_companies or None)
            ref_users = new_users
            print(f"  👤 Generated {len(new_users)} users")
        else:
            existing_users = get_users(db)
            for u in existing_users:
                ref_users.append(User(
                    u["userId"], u["username"], u.get("firstName", ""),
                    u.get("lastName", ""), u["email"], u["password"],
                    u["role"], u.get("companyId"),
                    u.get("vehicles", []), u.get("favorites", []),
                ))
            print(f"  👤 Using {len(ref_users)} existing users" if ref_users else "  ⚠️  No existing users found")

        if args.stations:
            if not ref_companies or not ref_groups:
                print("  ⚠️  Cannot generate stations without companies and groups. "
                      "Use --companies and --groups first, or run --all.")
            else:
                new_stations = generate_stations(
                    count=args.stations, companies=ref_companies, groups=ref_groups
                )
                ref_stations = new_stations
                print(f"  🔌 Generated {len(new_stations)} stations")
        else:
            existing_stations = get_stations(db)
            for s in existing_stations:
                ref_stations.append(Station(
                    s["stationId"], s.get("title", ""), s.get("groupId", ""),
                    s.get("location", {}), s.get("connector", {}), s.get("telemetry", {}),
                    s.get("state", "available"), s.get("alive", True),
                ))
            print(f"  🔌 Using {len(ref_stations)} existing stations" if ref_stations else "  ⚠️  No existing stations found")

        if args.tickets:
            if not ref_users or not ref_stations:
                print("  ⚠️  Cannot generate tickets without users and stations. "
                      "Use --users and --stations first, or run --all.")
            else:
                new_tickets = generate_tickets(
                    count=args.tickets, users=ref_users, stations=ref_stations,
                    ticket_type=args.ticket_type,
                )
                print(f"  🎫 Generated {len(new_tickets)} tickets (type: {args.ticket_type})")
        else:
            print("  🎫 Skipping tickets (use --tickets N to generate)")

        if args.usage:
            if not ref_users or not ref_stations:
                print("  ⚠️  Cannot generate usage without users and stations.")
            else:
                new_usage = generate_station_usage(count=args.usage, users=ref_users, stations=ref_stations)
                print(f"  ⚡ Generated {len(new_usage)} usage logs")

    insert_all(new_groups, new_companies, new_users, new_stations, new_tickets, new_usage)

    if args.ev_data or args.all:
        try:
            insert_ev_data("./data/open-ev-data.json")
        except FileNotFoundError:
            print("⚠️  Warning: open-ev-data.json not found, skipping static data.")

    print("\n✅ Done.")


if __name__ == "__main__":
    args = cli()
    resolve(args)
