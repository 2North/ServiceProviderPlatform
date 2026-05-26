package com.diploma.spp.repository;

import com.diploma.spp.model.Booking;
import com.diploma.spp.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByClient_Id(Long clientId);

    List<Booking> findByService_SpecialistProfile_Id(Long specialistId);

    List<Booking> findByStatus(BookingStatus status);

    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.client
            JOIN FETCH b.service s
            JOIN FETCH s.specialistProfile sp
            JOIN FETCH sp.user
            JOIN FETCH b.timeSlot
            WHERE b.id = :id
            """)
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);
}