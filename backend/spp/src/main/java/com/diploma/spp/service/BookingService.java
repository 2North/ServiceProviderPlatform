package com.diploma.spp.service;

import com.diploma.spp.dto.BookingDto;
import com.diploma.spp.event.BookingCancelledEvent;
import com.diploma.spp.event.BookingConfirmedEvent;
import com.diploma.spp.exception.ConflictException;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.Booking;
import com.diploma.spp.model.BookingStatus;
import com.diploma.spp.model.Payment;
import com.diploma.spp.model.ServiceListing;
import com.diploma.spp.model.SlotStatus;
import com.diploma.spp.model.TimeSlot;
import com.diploma.spp.model.User;
import com.diploma.spp.repository.BookingRepository;
import com.diploma.spp.repository.PaymentRepository;
import com.diploma.spp.repository.ServiceRepository;
import com.diploma.spp.repository.TimeSlotRepository;
import com.diploma.spp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PaymentRepository paymentRepository;
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

    @Transactional(readOnly = true)
    public List<BookingDto> getByClient(Long clientId) {
        return bookingRepository.findByClient_Id(clientId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
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
        ServiceListing svc = booking.getService();
        TimeSlot slot = booking.getTimeSlot();

        String specialistName = null;
        Long specialistProfileId = null;
        if (svc.getSpecialistProfile() != null) {
            specialistProfileId = svc.getSpecialistProfile().getId();
            if (svc.getSpecialistProfile().getUser() != null) {
                specialistName = svc.getSpecialistProfile().getUser().getEmail();
            }
        }

        Optional<Payment> payment = booking.getId() != null
                ? paymentRepository.findByBooking_Id(booking.getId())
                : Optional.empty();

        return BookingDto.builder()
                .id(booking.getId())
                .clientId(booking.getClient().getId())
                .serviceId(svc.getId())
                .specialistProfileId(specialistProfileId)
                .timeSlotId(slot.getId())
                .status(booking.getStatus())
                .note(booking.getNote())
                .createdAt(booking.getCreatedAt())
                .serviceName(svc.getTitle())
                .specialistName(specialistName)
                .price(svc.getPrice())
                .slotDate(slot.getSlotDate())
                .startTime(slot.getStartTime())
                .paymentId(payment.map(Payment::getId).orElse(null))
                .paymentStatus(payment.map(Payment::getStatus).orElse(null))
                .build();
    }
}