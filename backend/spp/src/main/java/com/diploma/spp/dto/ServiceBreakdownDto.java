package com.diploma.spp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceBreakdownDto {
    Long serviceId;
    String serviceName;
    Long bookingsCount;
    BigDecimal revenue;
    Double share;
}
