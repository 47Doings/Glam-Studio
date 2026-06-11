import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="glam_studio",
        user="postgres",
        password="postgres",
        cursor_factory=RealDictCursor
    )

if __name__ == "__main__":
    conn = get_connection()
    print("Connected to glam_studio successfully!")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services;")
    services = cursor.fetchall()

    for service in services:
        print(service)


    conn.close()