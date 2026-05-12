package com.diploma.spp.repository;

import com.diploma.spp.model.Booking;
import com.diploma.spp.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByClient_Id(Long clientId);

    List<Booking> findByService_SpecialistProfile_Id(Long specialistId);

    List<Booking> findByStatus(BookingStatus status);
}