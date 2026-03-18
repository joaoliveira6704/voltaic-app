from faker import Faker
import uuid
import csv 

fake = Faker()

file_path = './data-gen/users.csv'

with open(file_path, 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    
    writer.writerow(["id", "firstName", "lastName", "email", "password"])
    
    for i in range(20):
        firstName = fake.first_name()
        lastName = fake.last_name()
        
        email = f"{firstName}.{lastName}@{fake.free_email_domain()}"
        password = fake.password(length=12)
        user_id = uuid.uuid4()

        writer.writerow([user_id, firstName, lastName, email, password])
        print(f"User {i+1}: {firstName} {lastName}\nEmail:{email}\n")

print(f"\nDone! Created 20 users in {file_path}")