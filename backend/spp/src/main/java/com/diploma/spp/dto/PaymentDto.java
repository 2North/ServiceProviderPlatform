package com.diploma.spp.dto;

import com.diploma.spp.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentDto {
    Long id;
    Long bookingId;
    BigDecimal amount;
    String currency;
    PaymentStatus status;
    String stripePaymentIntentId;
    String clientSecret;
    LocalDateTime createdAt;
    LocalDateTime paidAt;
}
