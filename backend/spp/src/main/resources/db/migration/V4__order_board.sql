CREATE TYPE order_status AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED');
CREATE TYPE response_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE orders (
                        id              BIGSERIAL PRIMARY KEY,
                        client_id       BIGINT NOT NULL REFERENCES users(id),
                        category_id     BIGINT NOT NULL REFERENCES categories(id),
                        title           VARCHAR(255) NOT NULL,
                        description     TEXT,
                        budget          NUMERIC(10,2),
                        desired_date    DATE,
                        status          order_status NOT NULL DEFAULT 'OPEN',
                        created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_responses (
                                 id              BIGSERIAL PRIMARY KEY,
                                 order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                                 specialist_id   BIGINT NOT NULL REFERENCES specialist_profiles(id),
                                 proposed_price  NUMERIC(10,2),
                                 message         TEXT,
                                 status          response_status NOT NULL DEFAULT 'PENDING',
                                 created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                                 updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                                 CONSTRAINT unique_response UNIQUE (order_id, specialist_id)
);