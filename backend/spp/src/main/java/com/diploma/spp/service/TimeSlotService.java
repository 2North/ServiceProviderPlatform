package com.diploma.spp.service;

import com.diploma.spp.dto.TimeSlotDto;
import com.diploma.spp.model.SlotStatus;
import com.diploma.spp.model.SpecialistProfile;
import com.diploma.spp.model.TimeSlot;
import com.diploma.spp.repository.SpecialistProfileRepository;
import com.diploma.spp.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final SpecialistProfileRepository specialistProfileRepository;

    public TimeSlotDto create(TimeSlotDto dto) {
        SpecialistProfile profile = specialistProfileRepository.findById(dto.getSpecialistProfileId())
                .orElseThrow(() -> new RuntimeException("Specialist not found"));

        TimeSlot slot = TimeSlot.builder()
                .specialistProfile(profile)
                .slotDate(dto.getSlotDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(SlotStatus.AVAILABLE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toDto(timeSlotRepository.save(slot));
    }

    public List<TimeSlotDto> getBySpecialistAndDate(Long specialistId, LocalDate date) {
        return timeSlotRepository
                .findBySpecialistProfile_IdAndSlotDate(specialistId, date)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<TimeSlotDto> getAvailableBySpecialist(Long specialistId) {
        return timeSlotRepository
                .findBySpecialistProfile_IdAndStatus(specialistId, SlotStatus.AVAILABLE)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private TimeSlotDto toDto(TimeSlot slot) {
        return TimeSlotDto.builder()
                .id(slot.getId())
                .specialistProfileId(slot.getSpecialistProfile().getId())
                .slotDate(slot.getSlotDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(slot.getStatus())
                .build();
    }
}