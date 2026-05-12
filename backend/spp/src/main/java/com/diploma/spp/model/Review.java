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
@Table(name = "reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    Booking booking;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    User client;

    @ManyToOne
    @JoinColumn(name = "specialist_id", nullable = false)
    SpecialistProfile specialist;

    @Column(nullable = false)
    Integer rating;

    String text;

    String reply;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false)
    ReviewStatus status;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

}
