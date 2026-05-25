package com.diploma.spp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingDayDto {
    LocalDate date;
    Double averageRating;
    Long reviewsCount;
    Long cumulativeReviews;
}
