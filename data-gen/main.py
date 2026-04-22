from generator import generate_companies, generate_users, generate_stations, generate_tickets
from db import insert_all

if __name__ == "__main__":
    companies = generate_companies(count=10)
    users     = generate_users(count=500, companies=companies)
    stations  = generate_stations(count=20)
    tickets   = generate_tickets(count=20, users=users, stations=stations)

    insert_all(companies, users, stations, tickets)