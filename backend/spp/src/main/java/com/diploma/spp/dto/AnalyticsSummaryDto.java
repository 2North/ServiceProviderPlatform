package com.diploma.spp.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AnalyticsSummaryDto {
    BigDecimal totalRevenue30d;
    Long totalBookings30d;
    Double avgRating;
    Double repeatClientPct;
    BigDecimal revenueChangePct;
    Long bookingsChangePct;
}
