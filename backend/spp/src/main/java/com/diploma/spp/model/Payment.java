package com.diploma.spp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    Booking booking;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal amount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    String currency = "eur";

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false)
    @Builder.Default
    PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "stripe_payment_intent_id", nullable = false, unique = true)
    String stripePaymentIntentId;

    @Column(name = "stripe_client_secret", nullable = false, columnDefinition = "TEXT")
    String stripeClientSecret;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    LocalDateTime paidAt;
}
