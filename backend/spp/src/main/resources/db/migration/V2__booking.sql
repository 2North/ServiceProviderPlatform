-- Time slot status
CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'RESERVED', 'BOOKED', 'CANCELLED');

-- Current booking status
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- Time slots of a specialist
CREATE TABLE time_slots (
                            id              BIGSERIAL PRIMARY KEY,
                            specialist_id   BIGINT NOT NULL REFERENCES specialist_profiles(id) ON DELETE CASCADE,
                            slot_date       DATE NOT NULL,
                            start_time      TIME NOT NULL,
                            end_time        TIME NOT NULL,
                            status          slot_status NOT NULL DEFAULT 'AVAILABLE',
                            created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                            updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                            CONSTRAINT no_overlap UNIQUE (specialist_id, slot_date, start_time)
);

-- Booking table
CREATE TABLE bookings (
                          id              BIGSERIAL PRIMARY KEY,
                          client_id       BIGINT NOT NULL REFERENCES users(id),
                          service_id      BIGINT NOT NULL REFERENCES services(id),
                          time_slot_id    BIGINT NOT NULL UNIQUE REFERENCES time_slots(id),
                          status          booking_status NOT NULL DEFAULT 'PENDING',
                          note            TEXT,
                          created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                          updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);