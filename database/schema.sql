CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    duration_minutes INT NOT NULL
);

CREATE TABLE stylists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    working_hours_start TIME NOT NULL,
    working_hours_end TIME NOT NULL,
    working_days TEXT[] NOT NULL,
    status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE stylist_services (
    stylist_id INT NOT NULL,
    service_id INT NOT NULL,
    PRIMARY KEY (stylist_id, service_id),
    FOREIGN KEY (stylist_id) REFERENCES stylists(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    stylist_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    price NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (stylist_id) REFERENCES stylists(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);