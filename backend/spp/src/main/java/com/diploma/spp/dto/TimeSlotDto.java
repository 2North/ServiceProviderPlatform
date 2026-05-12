package com.diploma.spp.dto;

import com.diploma.spp.model.SlotStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotDto {
    Long id;
    Long specialistProfileId;
    LocalDate slotDate;
    LocalTime startTime;
    LocalTime endTime;
    SlotStatus status;
}