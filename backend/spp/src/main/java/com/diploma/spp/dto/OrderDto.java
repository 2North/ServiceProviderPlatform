package com.diploma.spp.dto;

import com.diploma.spp.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    Long id;
    Long clientId;
    Long categoryId;
    String title;
    String description;
    BigDecimal budget;
    LocalDate desiredDate;
    OrderStatus status;
    LocalDateTime createdAt;
}
