from generator import generate_companies, generate_users, generate_stations, generate_tickets
from db import insert_all, insert_ev_data

if __name__ == "__main__":
    """ Main entry point for data generation and insertion into MongoDB. """
    companies = generate_companies(count=10)
    users     = generate_users(count=100, companies=companies)
    stations  = generate_stations(count=20)
    tickets   = generate_tickets(count=20, users=users, stations=stations)

    insert_all(companies, users, stations, tickets)
    insert_ev_data("./data/open-ev-data.json")
    print("\nAll data inserted successfully")