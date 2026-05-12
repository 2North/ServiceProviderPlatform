package com.diploma.spp.dto;

import com.diploma.spp.model.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    Long id;
    Long bookingId;
    Long clientId;
    Long specialistId;
    Integer rating;
    String text;
    String reply;
    ReviewStatus status;
    LocalDateTime createdAt;
}