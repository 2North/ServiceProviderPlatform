package com.diploma.spp.event;

import com.diploma.spp.model.Booking;
import com.diploma.spp.repository.BookingRepository;
import com.diploma.spp.service.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarEventListener {

    private final GoogleCalendarService googleCalendarService;
    private final BookingRepository bookingRepository;

    @Async
    @EventListener
    public void onBookingConfirmed(BookingConfirmedEvent event) {
        Long bookingId = event.getBooking().getId();
        // Перезагружаем с fetch join — lazy associations недоступны в async потоке
        Booking booking = bookingRepository.findByIdWithDetails(bookingId).orElse(null);
        if (booking == null) {
            log.warn("Booking {} not found for Google Calendar sync", bookingId);
            return;
        }
        try {
            Map<Long, String> eventIds = googleCalendarService.createEventForBooking(booking);

            Long clientId = booking.getClient().getId();
            Long specialistId = booking.getService().getSpecialistProfile().getUser().getId();

            bookingRepository.findById(bookingId).ifPresent(b -> {
                if (eventIds.containsKey(clientId)) {
                    b.setGoogleEventIdClient(eventIds.get(clientId));
                }
                if (eventIds.containsKey(specialistId)) {
                    b.setGoogleEventIdSpecialist(eventIds.get(specialistId));
                }
                bookingRepository.save(b);
            });
        } catch (Exception e) {
            log.error("Failed to sync booking {} with Google Calendar: {}", bookingId, e.getMessage(), e);
        }
    }

    @Async
    @EventListener
    public void onBookingCancelled(BookingCancelledEvent event) {
        Long bookingId = event.getBooking().getId();
        Booking booking = bookingRepository.findByIdWithDetails(bookingId).orElse(null);
        if (booking == null) return;
        try {
            googleCalendarService.cancelEventForBooking(booking);
        } catch (Exception e) {
            log.error("Failed to cancel Google Calendar events for booking {}: {}",
                    bookingId, e.getMessage(), e);
        }
    }
}
