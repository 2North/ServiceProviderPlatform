package com.diploma.spp.service;

import com.diploma.spp.dto.BookingDto;
import com.diploma.spp.event.BookingCancelledEvent;
import com.diploma.spp.event.BookingConfirmedEvent;
import com.diploma.spp.exception.ConflictException;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.Booking;
import com.diploma.spp.model.BookingStatus;
import com.diploma.spp.model.ServiceListing;
import com.diploma.spp.model.SlotStatus;
import com.diploma.spp.model.TimeSlot;
import com.diploma.spp.model.User;
import com.diploma.spp.repository.BookingRepository;
import com.diploma.spp.repository.ServiceRepository;
import com.diploma.spp.repository.TimeSlotRepository;
import com.diploma.spp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public BookingDto create(BookingDto dto) {
        User client = userRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        ServiceListing serviceListing = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        TimeSlot slot = timeSlotRepository.findById(dto.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new ConflictException("Time slot is not available");
        }

        slot.setStatus(SlotStatus.BOOKED);
        slot.setUpdatedAt(LocalDateTime.now());
        timeSlotRepository.save(slot);

        Booking booking = Booking.builder()
                .client(client)
                .service(serviceListing)
                .timeSlot(slot)
                .status(BookingStatus.PENDING)
                .note(dto.getNote())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toDto(bookingRepository.save(booking));
    }

    public List<BookingDto> getByClient(Long clientId) {
        return bookingRepository.findByClient_Id(clientId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<BookingDto> getBySpecialist(Long specialistId) {
        return bookingRepository.findByService_SpecialistProfile_Id(specialistId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public BookingDto updateStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(status);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        if (status == BookingStatus.CONFIRMED) {
            eventPublisher.publishEvent(new BookingConfirmedEvent(this, saved));
        } else if (status == BookingStatus.CANCELLED) {
            eventPublisher.publishEvent(new BookingCancelledEvent(this, saved));
        }

        return toDto(saved);
    }

    private BookingDto toDto(Booking booking) {
        return BookingDto.builder()
                .id(booking.getId())
                .clientId(booking.getClient().getId())
                .serviceId(booking.getService().getId())
                .timeSlotId(booking.getTimeSlot().getId())
                .status(booking.getStatus())
                .note(booking.getNote())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}