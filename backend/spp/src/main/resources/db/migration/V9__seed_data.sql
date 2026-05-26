-- ══════════════════════════════════════════════════════
-- SEED DATA  |  пароль для всех: Test1234!
-- ══════════════════════════════════════════════════════

-- ── Категории ─────────────────────────────────────────
INSERT INTO categories (name) VALUES
  ('Ремонт и строительство'),
  ('Красота и уход'),
  ('Репетиторство'),
  ('IT и технологии'),
  ('Фото и видео')
ON CONFLICT DO NOTHING;

-- ── Специалисты ───────────────────────────────────────
INSERT INTO users (email, password, role, first_name, last_name, phone, created_at, updated_at) VALUES
  ('specialist1@mail.com', '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'SPECIALIST'::user_role, 'Андрей',  'Попеску',  '+37369111001', now(), now()),
  ('specialist2@mail.com', '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'SPECIALIST'::user_role, 'Мария',   'Иванова',  '+37369111002', now(), now()),
  ('specialist3@mail.com', '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'SPECIALIST'::user_role, 'Виктор',  'Лупу',     '+37369111003', now(), now()),
  ('specialist4@mail.com', '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'SPECIALIST'::user_role, 'Елена',   'Чобану',   '+37369111004', now(), now()),
  ('specialist5@mail.com', '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'SPECIALIST'::user_role, 'Дмитрий', 'Руссу',    '+37369111005', now(), now())
ON CONFLICT (email) DO NOTHING;

-- ── Клиенты ───────────────────────────────────────────
INSERT INTO users (email, password, role, first_name, last_name, phone, created_at, updated_at) VALUES
  ('client1@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Алексей',  'Морару',  '+37369222001', now(), now()),
  ('client2@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Наталья',  'Боднар',  '+37369222002', now(), now()),
  ('client3@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Сергей',   'Тимуш',   '+37369222003', now(), now()),
  ('client4@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Ирина',    'Негру',   '+37369222004', now(), now()),
  ('client5@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Павел',    'Стан',    '+37369222005', now(), now()),
  ('client6@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Оксана',   'Гуцу',    '+37369222006', now(), now()),
  ('client7@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Роман',    'Дану',    '+37369222007', now(), now()),
  ('client8@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Людмила',  'Паску',   '+37369222008', now(), now()),
  ('client9@mail.com',  '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Тудор',    'Влад',    '+37369222009', now(), now()),
  ('client10@mail.com', '$2a$10$Xn15oOe8FCVwbriKVYl0IOjd10cbQDl.Gw5yzNWFi7uIEruiv8yeO', 'CLIENT'::user_role, 'Кристина', 'Енаке',   '+37369222010', now(), now())
ON CONFLICT (email) DO NOTHING;

-- ── Профили специалистов ──────────────────────────────
INSERT INTO specialist_profiles (user_id, bio, experience, rating, verified, created_at, updated_at)
SELECT u.id, v.bio, v.exp, v.rating, true, now(), now()
FROM (VALUES
  ('specialist1@mail.com', 'Мастер-строитель, ремонт квартир под ключ.',    8,  4.8),
  ('specialist2@mail.com', 'Парикмахер и стилист, окрашивание и укладки.',  5,  4.7),
  ('specialist3@mail.com', 'Репетитор по математике и физике.',             10,  4.9),
  ('specialist4@mail.com', 'Full-stack разработчик, React и Spring Boot.',   6,  4.6),
  ('specialist5@mail.com', 'Фотограф, портреты и события.',                  4,  4.5)
) AS v(email, bio, exp, rating)
JOIN users u ON u.email = v.email
ON CONFLICT DO NOTHING;

-- ── Услуги (3 на специалиста = 15) ────────────────────
INSERT INTO services (specialist_id, category_id, title, description, price, duration, active, created_at, updated_at)
SELECT sp.id, c.id, v.title, v.descr, v.price::numeric, v.dur, true, now(), now()
FROM (VALUES
  ('specialist1@mail.com', 'Ремонт и строительство', 'Штукатурка стен',       'Выравнивание и штукатурка.',         '350.00', 240),
  ('specialist1@mail.com', 'Ремонт и строительство', 'Укладка плитки',        'Ванная, кухня, любые форматы.',      '500.00', 300),
  ('specialist1@mail.com', 'Ремонт и строительство', 'Монтаж гипсокартона',   'Перегородки и потолки.',             '400.00', 270),
  ('specialist2@mail.com', 'Красота и уход',          'Стрижка и укладка',     'Женская и мужская стрижка.',         '150.00',  60),
  ('specialist2@mail.com', 'Красота и уход',          'Окрашивание волос',     'Однотонное и мелирование.',          '350.00', 120),
  ('specialist2@mail.com', 'Красота и уход',          'Уход за бровями',       'Коррекция и окрашивание.',            '80.00',  30),
  ('specialist3@mail.com', 'Репетиторство',           'Математика 9-12 класс', 'Подготовка к экзаменам.',            '200.00',  90),
  ('specialist3@mail.com', 'Репетиторство',           'Физика 10-12 класс',    'Механика, электродинамика.',         '200.00',  90),
  ('specialist3@mail.com', 'Репетиторство',           'Подготовка к BAC',      'Интенсив по всем темам.',            '300.00', 120),
  ('specialist4@mail.com', 'IT и технологии',         'Разработка лендинга',   'Адаптивный сайт на React.',         '1200.00', 480),
  ('specialist4@mail.com', 'IT и технологии',         'REST API на Spring',    'Проектирование и реализация.',      '1500.00', 600),
  ('specialist4@mail.com', 'IT и технологии',         'Консультация по коду',  'Код-ревью, архитектурные советы.',   '250.00',  60),
  ('specialist5@mail.com', 'Фото и видео',            'Портретная съёмка',     '1 час, 20 обработанных фото.',       '400.00',  60),
  ('specialist5@mail.com', 'Фото и видео',            'Съёмка мероприятий',    'До 4 часов, репортаж.',              '800.00', 240),
  ('specialist5@mail.com', 'Фото и видео',            'Предметная съёмка',     'Товары для маркетплейсов.',          '300.00',  90)
) AS v(email, cat, title, descr, price, dur)
JOIN users u ON u.email = v.email
JOIN specialist_profiles sp ON sp.user_id = u.id
JOIN categories c ON c.name = v.cat
ON CONFLICT DO NOTHING;

-- ── Слоты (3 будущих AVAILABLE + 3 прошлых BOOKED на специалиста) ──
INSERT INTO time_slots (specialist_id, slot_date, start_time, end_time, status, created_at, updated_at)
SELECT sp.id, v.sd::date, v.st::time, v.et::time, v.sts::slot_status, now(), now()
FROM (VALUES
  ('specialist1@mail.com', '2026-06-02', '09:00', '13:00', 'AVAILABLE'),
  ('specialist1@mail.com', '2026-06-03', '10:00', '14:00', 'AVAILABLE'),
  ('specialist1@mail.com', '2026-06-04', '09:00', '13:00', 'AVAILABLE'),
  ('specialist1@mail.com', '2026-05-20', '09:00', '13:00', 'BOOKED'),
  ('specialist1@mail.com', '2026-05-21', '09:00', '13:00', 'BOOKED'),
  ('specialist1@mail.com', '2026-05-22', '09:00', '13:00', 'BOOKED'),

  ('specialist2@mail.com', '2026-06-02', '10:00', '11:00', 'AVAILABLE'),
  ('specialist2@mail.com', '2026-06-02', '11:00', '12:00', 'AVAILABLE'),
  ('specialist2@mail.com', '2026-06-03', '10:00', '11:00', 'AVAILABLE'),
  ('specialist2@mail.com', '2026-05-19', '10:00', '11:00', 'BOOKED'),
  ('specialist2@mail.com', '2026-05-20', '11:00', '12:00', 'BOOKED'),
  ('specialist2@mail.com', '2026-05-21', '10:00', '11:00', 'BOOKED'),

  ('specialist3@mail.com', '2026-06-02', '14:00', '15:30', 'AVAILABLE'),
  ('specialist3@mail.com', '2026-06-03', '14:00', '15:30', 'AVAILABLE'),
  ('specialist3@mail.com', '2026-06-04', '14:00', '15:30', 'AVAILABLE'),
  ('specialist3@mail.com', '2026-05-19', '14:00', '15:30', 'BOOKED'),
  ('specialist3@mail.com', '2026-05-20', '14:00', '15:30', 'BOOKED'),
  ('specialist3@mail.com', '2026-05-21', '14:00', '15:30', 'BOOKED'),

  ('specialist4@mail.com', '2026-06-02', '09:00', '10:00', 'AVAILABLE'),
  ('specialist4@mail.com', '2026-06-03', '09:00', '10:00', 'AVAILABLE'),
  ('specialist4@mail.com', '2026-06-05', '09:00', '10:00', 'AVAILABLE'),
  ('specialist4@mail.com', '2026-05-18', '09:00', '10:00', 'BOOKED'),
  ('specialist4@mail.com', '2026-05-19', '09:00', '10:00', 'BOOKED'),
  ('specialist4@mail.com', '2026-05-20', '09:00', '10:00', 'BOOKED'),

  ('specialist5@mail.com', '2026-06-06', '11:00', '12:00', 'AVAILABLE'),
  ('specialist5@mail.com', '2026-06-07', '11:00', '12:00', 'AVAILABLE'),
  ('specialist5@mail.com', '2026-06-08', '11:00', '12:00', 'AVAILABLE'),
  ('specialist5@mail.com', '2026-05-17', '11:00', '12:00', 'BOOKED'),
  ('specialist5@mail.com', '2026-05-18', '11:00', '12:00', 'BOOKED'),
  ('specialist5@mail.com', '2026-05-19', '11:00', '12:00', 'BOOKED')
) AS v(email, sd, st, et, sts)
JOIN users u ON u.email = v.email
JOIN specialist_profiles sp ON sp.user_id = u.id
ON CONFLICT DO NOTHING;

-- ── Бронирования (15 штук, на прошлых BOOKED слотах) ──
INSERT INTO bookings (client_id, service_id, time_slot_id, status, note, created_at, updated_at)
SELECT
  cu.id,
  (SELECT s.id FROM services s
   JOIN specialist_profiles sp2 ON sp2.id = s.specialist_id
   WHERE sp2.user_id = su.id AND s.title = v.svc LIMIT 1),
  (SELECT ts.id FROM time_slots ts
   JOIN specialist_profiles sp2 ON sp2.id = ts.specialist_id
   WHERE sp2.user_id = su.id AND ts.slot_date = v.sd::date AND ts.status = 'BOOKED'::slot_status
   LIMIT 1),
  v.bst::booking_status,
  v.note,
  now(), now()
FROM (VALUES
  ('client1@mail.com',  'specialist1@mail.com', 'Штукатурка стен',       '2026-05-20', 'CONFIRMED', 'Кухня и прихожая'),
  ('client2@mail.com',  'specialist1@mail.com', 'Укладка плитки',        '2026-05-21', 'CONFIRMED', NULL),
  ('client3@mail.com',  'specialist1@mail.com', 'Монтаж гипсокартона',   '2026-05-22', 'CONFIRMED', 'Перегородка в спальне'),
  ('client4@mail.com',  'specialist2@mail.com', 'Стрижка и укладка',     '2026-05-19', 'CONFIRMED', NULL),
  ('client5@mail.com',  'specialist2@mail.com', 'Окрашивание волос',     '2026-05-20', 'CONFIRMED', 'Мелирование'),
  ('client6@mail.com',  'specialist2@mail.com', 'Уход за бровями',       '2026-05-21', 'CONFIRMED', NULL),
  ('client7@mail.com',  'specialist3@mail.com', 'Математика 9-12 класс', '2026-05-19', 'CONFIRMED', NULL),
  ('client8@mail.com',  'specialist3@mail.com', 'Физика 10-12 класс',    '2026-05-20', 'CONFIRMED', 'Подготовка к BAC'),
  ('client9@mail.com',  'specialist3@mail.com', 'Подготовка к BAC',      '2026-05-21', 'CONFIRMED', NULL),
  ('client10@mail.com', 'specialist4@mail.com', 'Разработка лендинга',   '2026-05-18', 'CONFIRMED', 'Сайт для кофейни'),
  ('client1@mail.com',  'specialist4@mail.com', 'REST API на Spring',    '2026-05-19', 'CONFIRMED', NULL),
  ('client2@mail.com',  'specialist4@mail.com', 'Консультация по коду',  '2026-05-20', 'CONFIRMED', NULL),
  ('client3@mail.com',  'specialist5@mail.com', 'Портретная съёмка',     '2026-05-17', 'CONFIRMED', NULL),
  ('client4@mail.com',  'specialist5@mail.com', 'Съёмка мероприятий',    '2026-05-18', 'CONFIRMED', 'День рождения'),
  ('client5@mail.com',  'specialist5@mail.com', 'Предметная съёмка',     '2026-05-19', 'CONFIRMED', NULL)
) AS v(ce, se, svc, sd, bst, note)
JOIN users cu ON cu.email = v.ce
JOIN users su ON su.email = v.se
ON CONFLICT DO NOTHING;

-- ── Отзывы ────────────────────────────────────────────
INSERT INTO reviews (booking_id, client_id, specialist_id, rating, text, status, created_at, updated_at)
SELECT b.id, cu.id, sp.id, v.rating, v.txt, 'APPROVED'::review_status, now(), now()
FROM (VALUES
  ('client1@mail.com',  'specialist1@mail.com', 5, 'Отличная работа, всё аккуратно.'),
  ('client2@mail.com',  'specialist1@mail.com', 4, 'Хорошо, чуть дольше запланированного.'),
  ('client3@mail.com',  'specialist1@mail.com', 5, 'Мастер своего дела, рекомендую.'),
  ('client4@mail.com',  'specialist2@mail.com', 5, 'Мария — профессионал, результат отличный.'),
  ('client5@mail.com',  'specialist2@mail.com', 4, 'Хорошо, немного затянулось.'),
  ('client6@mail.com',  'specialist2@mail.com', 5, 'Очень довольна, буду ещё.'),
  ('client7@mail.com',  'specialist3@mail.com', 5, 'Виктор объясняет понятно, сдал на 9.'),
  ('client8@mail.com',  'specialist3@mail.com', 5, 'Лучший репетитор, рекомендую.'),
  ('client9@mail.com',  'specialist3@mail.com', 4, 'Задания подобраны по уровню.'),
  ('client10@mail.com', 'specialist4@mail.com', 5, 'Сайт готов в срок, код чистый.'),
  ('client1@mail.com',  'specialist4@mail.com', 4, 'Хорошая консультация, много полезного.'),
  ('client3@mail.com',  'specialist5@mail.com', 5, 'Фото получились восхитительно.'),
  ('client4@mail.com',  'specialist5@mail.com', 5, 'Дмитрий — мастер, все гости в восторге.')
) AS v(ce, se, rating, txt)
JOIN users cu ON cu.email = v.ce
JOIN users su ON su.email = v.se
JOIN specialist_profiles sp ON sp.user_id = su.id
JOIN bookings b ON b.client_id = cu.id
  AND b.service_id IN (SELECT id FROM services WHERE specialist_id = sp.id)
ON CONFLICT DO NOTHING;

-- ── Заказы на доске (12 открытых + 2 закрытых) ────────
INSERT INTO orders (client_id, category_id, title, description, budget, desired_date, status, created_at, updated_at)
SELECT cu.id, c.id, v.title, v.descr, v.budget::numeric, v.dd::date, v.ost::order_status, now(), now()
FROM (VALUES
  ('client1@mail.com',  'Ремонт и строительство', 'Покраска потолков',      'Две комнаты ~30 кв.м.',           '200.00', '2026-06-10', 'OPEN'),
  ('client2@mail.com',  'Красота и уход',          'Свадебная причёска',     'Выезд на дом утром.',             '300.00', '2026-06-15', 'OPEN'),
  ('client3@mail.com',  'Репетиторство',           'Английский для ребёнка', '8 лет, уровень A1.',              '150.00', '2026-06-05', 'OPEN'),
  ('client4@mail.com',  'IT и технологии',         'Telegram-бот',           'Простой бот для записи.',         '500.00', '2026-06-20', 'OPEN'),
  ('client5@mail.com',  'Фото и видео',            'Фото для резюме',        'Бизнес-портрет, 1 час.',          '200.00', '2026-06-08', 'OPEN'),
  ('client6@mail.com',  'Ремонт и строительство',  'Установка дверей',       'Три межкомнатные двери.',         '350.00', '2026-06-12', 'OPEN'),
  ('client7@mail.com',  'Красота и уход',          'Маникюр и педикюр',      'Гель-лак, любой цвет.',           '120.00', '2026-06-04', 'OPEN'),
  ('client8@mail.com',  'Репетиторство',           'Химия для поступления',  'ВУЗ, интенсивный курс.',          '400.00', '2026-06-18', 'OPEN'),
  ('client9@mail.com',  'IT и технологии',         'Настройка Wi-Fi дома',   'Роутер и 3 точки доступа.',       '150.00', '2026-06-03', 'OPEN'),
  ('client10@mail.com', 'Фото и видео',            'Видео с корпоратива',    'Монтаж ролика до 5 минут.',       '600.00', '2026-06-25', 'OPEN'),
  ('client1@mail.com',  'IT и технологии',         'Верстка email-шаблона',  'HTML, адаптив для Gmail.',        '250.00', '2026-06-07', 'OPEN'),
  ('client2@mail.com',  'Ремонт и строительство',  'Укладка ламината',       '~20 кв.м., материал есть.',      '280.00', '2026-06-14', 'OPEN'),
  ('client3@mail.com',  'Красота и уход',          'Окрашивание ресниц',     'Хна, брови и ресницы.',            '70.00', '2026-05-28', 'CLOSED'),
  ('client4@mail.com',  'Репетиторство',           'История для BAC',        'Остался месяц до экзамена.',      '180.00', '2026-05-25', 'CLOSED')
) AS v(ce, cat, title, descr, budget, dd, ost)
JOIN users cu ON cu.email = v.ce
JOIN categories c ON c.name = v.cat
ON CONFLICT DO NOTHING;
