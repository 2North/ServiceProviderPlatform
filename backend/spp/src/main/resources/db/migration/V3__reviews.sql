CREATE TYPE review_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE reviews (
                         id              BIGSERIAL PRIMARY KEY,
                         booking_id      BIGINT NOT NULL UNIQUE REFERENCES bookings(id),
                         client_id       BIGINT NOT NULL REFERENCES users(id),
                         specialist_id   BIGINT NOT NULL REFERENCES specialist_profiles(id),
                         rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                         text            TEXT,
                         reply           TEXT,
                         status          review_status NOT NULL DEFAULT 'PENDING',
                         created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                         updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);