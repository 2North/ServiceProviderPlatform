package com.diploma.spp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "payment_id", nullable = false)
    Payment payment;

    @Column(name = "event_type", nullable = false, length = 100)
    String eventType;

    @Column(name = "stripe_event_id", nullable = false, unique = true)
    String stripeEventId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    String payload;

    @Column(nullable = false)
    LocalDateTime receivedAt;
}
