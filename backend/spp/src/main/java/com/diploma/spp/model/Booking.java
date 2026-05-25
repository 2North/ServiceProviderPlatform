package com.diploma.spp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;


import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    User client;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    ServiceListing service;

    @OneToOne
    @JoinColumn(name = "time_slot_id", nullable = false)
    TimeSlot timeSlot;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false)
    BookingStatus status;

    String note;

    @OneToOne
    @JoinColumn(name = "payment_id")
    Payment payment;

    @Column(name = "google_event_id_client", length = 1024)
    String googleEventIdClient;

    @Column(name = "google_event_id_specialist", length = 1024)
    String googleEventIdSpecialist;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}