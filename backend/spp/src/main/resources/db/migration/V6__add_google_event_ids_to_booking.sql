ALTER TABLE bookings
    ADD COLUMN google_event_id_client     VARCHAR(1024),
    ADD COLUMN google_event_id_specialist VARCHAR(1024);
