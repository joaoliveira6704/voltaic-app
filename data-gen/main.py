from faker import Faker
import uuid
import csv 
import pymongo
import os

fake = Faker()

file_path = './app/users.csv'

users = []

class User:
    def __init__(self, userId, username, firstName, lastName, email, password, role, companyId, vehicles, favorites):
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


for i in range(20):
    firstName = fake.first_name()
    lastName = fake.last_name()
    username = f"{firstName.lower()}{lastName.lower()}{fake.random_int(min=10, max=99)}"
        
    email = f"{firstName}.{lastName}@{fake.free_email_domain()}"
    password = fake.password(length=12)
    user_id = str(uuid.uuid4())
    role = fake.random_element(elements=("client", "admin", "worker", "company-manager"))
    companyId = None
    vehicles = []
    favorites = []

    users.append(User(user_id, username, firstName, lastName, email, password, role, companyId, vehicles, favorites))
    print(f"User {i+1}: {firstName} {lastName} ({username})\nEmail:{email}\n")

print("Users created successfully")

# Fetch from environment or fallback to localhost if running manually on host machine
mongo_uri = os.environ.get(
    "MONGO_URI", 
    "mongodb://root:example@mongodb:27017/voltaic-db?authSource=admin"
)
client = pymongo.MongoClient(mongo_uri)
db = client["voltaic-db"]

# Insert to MongoDB
db.users.insert_many([user.__dict__ for user in users])

print("Users inserted successfully")
