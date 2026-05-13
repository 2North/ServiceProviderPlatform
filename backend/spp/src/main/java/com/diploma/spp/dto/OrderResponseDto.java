package com.diploma.spp.dto;

import com.diploma.spp.model.ResponseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    Long id;
    Long orderId;
    Long specialistId;
    BigDecimal proposedPrice;
    String message;
    ResponseStatus status;
    LocalDateTime createdAt;
}
