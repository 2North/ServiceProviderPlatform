package com.diploma.spp.scheduler;

import com.diploma.spp.model.BookingStatus;
import com.diploma.spp.model.SlotStatus;
import com.diploma.spp.repository.BookingRepository;
import com.diploma.spp.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlotScheduler {

    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;

    // Каждый час — закрываем прошедшие слоты
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireOldSlots() {
        LocalDate today = LocalDate.now();
        timeSlotRepository.findAll().stream()
                .filter(slot -> slot.getSlotDate().isBefore(today))
                .filter(slot -> slot.getStatus() == SlotStatus.AVAILABLE)
                .forEach(slot -> {
                    slot.setStatus(SlotStatus.CANCELLED);
                    slot.setUpdatedAt(LocalDateTime.now());
                    timeSlotRepository.save(slot);
                });
        log.info("Expired old slots job executed at {}", LocalDateTime.now());
    }

    // Каждые 5 минут — отменяем неоплаченные бронирования
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void cancelPendingBookings() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        bookingRepository.findByStatus(BookingStatus.PENDING).stream()
                .filter(booking -> booking.getCreatedAt().isBefore(threshold))
                .forEach(booking -> {
                    booking.setStatus(BookingStatus.CANCELLED);
                    booking.setUpdatedAt(LocalDateTime.now());
                    bookingRepository.save(booking);

                    // Освобождаем слот
                    booking.getTimeSlot().setStatus(SlotStatus.AVAILABLE);
                    booking.getTimeSlot().setUpdatedAt(LocalDateTime.now());
                });
        log.info("Cancel pending bookings job executed at {}", LocalDateTime.now());
    }
}