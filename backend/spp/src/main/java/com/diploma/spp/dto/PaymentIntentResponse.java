package com.diploma.spp.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentIntentResponse {
    Long paymentId;
    String clientSecret;
    BigDecimal amount;
    String currency;
}
