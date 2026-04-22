import os
import pymongo


def get_db():
    mongo_uri = os.environ.get(
        "MONGO_URI",
        "mongodb://root:root@localhost:27017/voltaic-db?authSource=admin"
    )
    client = pymongo.MongoClient(mongo_uri)
    return client["voltaic-db"]


def insert_all(companies, users, stations, tickets):
    db = get_db()

    db.companies.insert_many([c.__dict__ for c in companies])
    print(f"Inserted {len(companies)} companies")

    db.users.insert_many([u.__dict__ for u in users])
    print(f"Inserted {len(users)} users")

    db.stations.insert_many([s.__dict__ for s in stations])
    print(f"Inserted {len(stations)} stations")

    db.tickets.insert_many([t.__dict__ for t in tickets])
    print(f"Inserted {len(tickets)} tickets")

    print("\nAll data inserted successfully")