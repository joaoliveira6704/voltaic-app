from faker import Faker

fake = Faker()

for i in range(20):
    print(f"Person {i+1}: {fake.first_name()} {fake.last_name()}")
    print(fake.email(safe=True,domain="company.com"))