import json
import os
import pymongo

def get_db():
    """ Establish a connection to the MongoDB database and return the database object. """
    mongo_uri = os.environ.get(
        "MONGO_URI",
        "mongodb://root:root@localhost:27018/voltaic-db?authSource=admin"
    )
    client = pymongo.MongoClient(mongo_uri)
    return client["voltaic-db"]

def insert_all(companies, users, stations, tickets, station_usage):
    """ Insert all data into the database. """
    db = get_db()

    db.companies.insert_many([c.__dict__ for c in companies])
    print(f"Inserted {len(companies)} companies")

    db.users.insert_many([u.__dict__ for u in users])
    print(f"Inserted {len(users)} users")

    db.stations.insert_many([s.__dict__ for s in stations])
    print(f"Inserted {len(stations)} stations")

    db.tickets.insert_many([t.__dict__ for t in tickets])
    print(f"Inserted {len(tickets)} tickets")

    db.stations_usage.insert_many([su.__dict__ for su in station_usage])
    print(f"Inserted {len(station_usage)} station usage records")

def insert_ev_data(filepath: str = "data/open-ev-data.json"):
    """ Insert EV data from a JSON file into the database. """
    db = get_db()

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    vehicles = data.get("vehicles", [])

    if not vehicles:
        print("No vehicles found in file.")
        return

    result = db.vehicles.insert_many(vehicles)
    print(f"Inserted {len(result.inserted_ids)} vehicles")