import json
import os
from datetime import datetime, timezone

import pymongo


def get_db():
    """Establish a connection to the MongoDB database and return the database object."""
    mongo_uri = os.environ.get(
        "MONGO_URI",
        "mongodb+srv://joaopedrooliveira6704_db_user:gmaJ9x86WYbA99Tj@voltaiccluster.vfngrdo.mongodb.net/?appName=voltaicCluster",
    )
    client = pymongo.MongoClient(mongo_uri)
    return client["voltaic-db"]


def insert_all(groups, companies, users, stations, tickets, usage):
    db = get_db()
    now = datetime.now(timezone.utc)

    data_map = [
        (groups, "groups"),
        (companies, "companies"),
        (users, "users"),
        (stations, "stations"),
        (tickets, "tickets"),
        (usage, "usages"),
    ]

    for data_list, collection_name in data_map:
        if data_list:
            dicts = []
            for obj in data_list:
                d = obj.__dict__.copy()
                # Auto-add if they don't exist in the class
                if "createdAt" not in d:
                    d["createdAt"] = now
                if "updatedAt" not in d:
                    d["updatedAt"] = now
                dicts.append(d)

            db[collection_name].insert_many(dicts)
            print(f"✅ {collection_name}: Inserted with timestamps.")


def insert_ev_data(filepath: str = "data/open-ev-data.json"):
    """Insert EV data from a JSON file into the database."""
    db = get_db()

    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    vehicles = data.get("vehicles", [])

    if not vehicles:
        print("No vehicles found in file.")
        return

    result = db.vehicles.insert_many(vehicles)
    print(f"Inserted {len(result.inserted_ids)} vehicles")
