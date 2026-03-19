-- Роли пользователей
CREATE TYPE user_role AS ENUM ('CLIENT', 'SPECIALIST', 'ADMIN');

-- Пользователи
CREATE TABLE users (
                       id          BIGSERIAL PRIMARY KEY,
                       email       VARCHAR(255) NOT NULL UNIQUE,
                       password    VARCHAR(255) NOT NULL,
                       first_name  VARCHAR(100) NOT NULL,
                       last_name   VARCHAR(100) NOT NULL,
                       phone       VARCHAR(20),
                       role        user_role NOT NULL DEFAULT 'CLIENT',
                       enabled     BOOLEAN NOT NULL DEFAULT true,
                       created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
                       updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Категории услуг
CREATE TABLE categories (
                            id          BIGSERIAL PRIMARY KEY,
                            name        VARCHAR(100) NOT NULL UNIQUE,
                            description TEXT,
                            created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Профили специалистов
CREATE TABLE specialist_profiles (
                                     id          BIGSERIAL PRIMARY KEY,
                                     user_id     BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                                     bio         TEXT,
                                     experience  INTEGER,
                                     rating      NUMERIC(3,2) DEFAULT 0.00,
                                     verified    BOOLEAN NOT NULL DEFAULT false,
                                     created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
                                     updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Услуги
CREATE TABLE services (
                          id              BIGSERIAL PRIMARY KEY,
                          specialist_id   BIGINT NOT NULL REFERENCES specialist_profiles(id) ON DELETE CASCADE,
                          category_id     BIGINT NOT NULL REFERENCES categories(id),
                          title           VARCHAR(255) NOT NULL,
                          description     TEXT,
                          price           NUMERIC(10,2) NOT NULL,
                          duration        INTEGER NOT NULL,
                          active          BOOLEAN NOT NULL DEFAULT true,
                          created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                          updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);