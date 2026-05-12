package com.diploma.spp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {
    Long specialistId;
    Long totalBookings;
    Long completedBookings;
    Long cancelledBookings;
    Long pendingBookings;
    Double averageRating;
    Long totalReviews;
    BigDecimal totalEarnings;
}

