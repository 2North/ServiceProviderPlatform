CREATE TABLE user_google_integrations (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   TEXT NOT NULL,
    access_token    TEXT,
    token_expires_at TIMESTAMP,
    calendar_id     VARCHAR(255) NOT NULL DEFAULT 'primary',
    valid           BOOLEAN NOT NULL DEFAULT TRUE,
    connected_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
