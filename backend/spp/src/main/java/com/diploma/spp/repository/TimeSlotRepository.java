package com.diploma.spp.repository;

import com.diploma.spp.model.SlotStatus;
import com.diploma.spp.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findBySpecialistProfile_IdAndSlotDate(Long specialistId, LocalDate date);

    List<TimeSlot> findBySpecialistProfile_IdAndStatus(Long specialistId, SlotStatus status);
}