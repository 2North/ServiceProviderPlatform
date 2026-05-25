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
        Booking booking = event.getBooking();
        try {
            Map<Long, String> eventIds = googleCalendarService.createEventForBooking(booking);

            Long clientId = booking.getClient().getId();
            Long specialistId = booking.getService().getSpecialistProfile().getUser().getId();

            // Persist google event ids back to the booking
            bookingRepository.findById(booking.getId()).ifPresent(b -> {
                if (eventIds.containsKey(clientId)) {
                    b.setGoogleEventIdClient(eventIds.get(clientId));
                }
                if (eventIds.containsKey(specialistId)) {
                    b.setGoogleEventIdSpecialist(eventIds.get(specialistId));
                }
                bookingRepository.save(b);
            });
        } catch (Exception e) {
            log.error("Failed to sync booking {} with Google Calendar: {}", booking.getId(), e.getMessage());
        }
    }

    @Async
    @EventListener
    public void onBookingCancelled(BookingCancelledEvent event) {
        Booking booking = event.getBooking();
        try {
            googleCalendarService.cancelEventForBooking(booking);
        } catch (Exception e) {
            log.error("Failed to cancel Google Calendar events for booking {}: {}",
                    booking.getId(), e.getMessage());
        }
    }
}
