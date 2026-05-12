package com.diploma.spp.dto;

import com.diploma.spp.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    Long id;
    Long clientId;
    Long serviceId;
    Long timeSlotId;
    BookingStatus status;
    String note;
    LocalDateTime createdAt;
}