package com.diploma.spp.dto;

import com.diploma.spp.model.BookingStatus;
import com.diploma.spp.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    Long id;
    Long clientId;
    Long serviceId;
    Long specialistProfileId;
    Long timeSlotId;
    BookingStatus status;
    String note;
    LocalDateTime createdAt;

    // Enriched fields for the client bookings view
    String serviceName;
    String specialistName;
    BigDecimal price;
    LocalDate slotDate;
    LocalTime startTime;

    // Payment info
    Long paymentId;
    PaymentStatus paymentStatus;
}