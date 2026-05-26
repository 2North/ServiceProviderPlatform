ALTER TABLE services
    ADD CONSTRAINT unique_service_title_per_specialist UNIQUE (specialist_id, title);
