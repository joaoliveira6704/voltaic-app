import json
import os
from datetime import datetime, timezone

import pymongo
from bson.objectid import ObjectId


def get_db():
    mongo_uri = os.environ.get(
        "MONGO_URI",
        "mongodb+srv://joaopedrooliveira6704_db_user:gmaJ9x86WYbA99Tj@voltaiccluster.vfngrdo.mongodb.net/?appName=voltaicCluster",
    )
    client = pymongo.MongoClient(mongo_uri)
    return client["voltaic-db"]


def _convert_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def get_groups(db):
    return list(db.groups.find({}))


def get_companies(db):
    return list(db.companies.find({}))


def get_users(db, role=None):
    q = {"role": role} if role else {}
    return list(db.users.find(q))


def get_stations(db, limit=0):
    cursor = db.stations.find({})
    if limit:
        cursor = cursor.limit(limit)
    return list(cursor)


def drop_collections(db, collections=None):
    if collections is None:
        collections = ["groups", "companies", "users", "stations", "tickets", "usages"]
    for name in collections:
        db[name].drop()
        print(f"🗑️  Dropped collection '{name}'.")


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
                if "createdAt" not in d:
                    d["createdAt"] = now
                if "updatedAt" not in d:
                    d["updatedAt"] = now
                dicts.append(d)

            db[collection_name].insert_many(dicts)
            print(f"✅ {collection_name}: Inserted {len(dicts)} documents.")


def insert_ev_data(filepath="data/open-ev-data.json"):
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

    existing = db.vehicles.count_documents({})
    if existing:
        print(f"⚠️  Vehicles collection already has {existing} documents. Skipping import.")
        return

    result = db.vehicles.insert_many(vehicles)
    print(f"✅ Imported {len(result.inserted_ids)} vehicles.")
