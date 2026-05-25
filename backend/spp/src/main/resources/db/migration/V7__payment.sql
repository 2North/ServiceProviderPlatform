CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'REQUIRES_ACTION',
    'SUCCEEDED',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);

CREATE TABLE payments (
    id                          BIGSERIAL PRIMARY KEY,
    booking_id                  BIGINT NOT NULL UNIQUE REFERENCES bookings(id),
    amount                      NUMERIC(10,2) NOT NULL,
    currency                    VARCHAR(3) NOT NULL DEFAULT 'eur',
    status                      payment_status NOT NULL DEFAULT 'PENDING',
    stripe_payment_intent_id    VARCHAR(255) NOT NULL UNIQUE,
    stripe_client_secret        TEXT NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    paid_at                     TIMESTAMP
);

CREATE TABLE payment_events (
    id              BIGSERIAL PRIMARY KEY,
    payment_id      BIGINT NOT NULL REFERENCES payments(id),
    event_type      VARCHAR(100) NOT NULL,
    stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
    payload         JSONB,
    received_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings
    ADD COLUMN payment_id BIGINT REFERENCES payments(id);
