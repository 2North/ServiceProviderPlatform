package com.diploma.spp.service;

import com.diploma.spp.config.StripeProperties;
import com.diploma.spp.model.*;
import com.diploma.spp.repository.BookingRepository;
import com.diploma.spp.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripePaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private StripeProperties stripeProperties;

    @InjectMocks
    private StripePaymentService paymentService;

    private Booking booking;
    private Payment payment;

    @BeforeEach
    void setUp() {
        User client = User.builder().id(1L).email("client@test.com")
                .firstName("Ivan").lastName("Petrov").build();

        SpecialistProfile profile = SpecialistProfile.builder().id(10L).build();

        ServiceListing service = ServiceListing.builder()
                .id(100L)
                .title("Haircut")
                .price(BigDecimal.valueOf(50))
                .specialistProfile(profile)
                .build();

        TimeSlot slot = TimeSlot.builder()
                .id(200L)
                .slotDate(LocalDate.of(2026, 6, 15))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .build();

        booking = Booking.builder()
                .id(300L)
                .client(client)
                .service(service)
                .timeSlot(slot)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        payment = Payment.builder()
                .id(1L)
                .booking(booking)
                .amount(BigDecimal.valueOf(50))
                .currency("eur")
                .status(PaymentStatus.SUCCEEDED)
                .stripePaymentIntentId("pi_test_123")
                .stripeClientSecret("pi_test_123_secret_abc")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void confirmPaymentSucceeded_updatesPaymentAndBookingStatus() {
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        payment.setStatus(PaymentStatus.PENDING);
        when(paymentRepository.findByStripePaymentIntentId("pi_test_123"))
                .thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);
        when(bookingRepository.save(any())).thenReturn(booking);

        paymentService.confirmPaymentSucceeded("pi_test_123");

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCEEDED);
        assertThat(payment.getPaidAt()).isNotNull();
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    void confirmPaymentSucceeded_unknownIntent_throws() {
        when(paymentRepository.findByStripePaymentIntentId("pi_unknown"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.confirmPaymentSucceeded("pi_unknown"))
                .isInstanceOf(com.diploma.spp.exception.ResourceNotFoundException.class);
    }

    @Test
    void markPaymentFailed_setsFailedStatus() {
        payment.setStatus(PaymentStatus.PENDING);
        when(paymentRepository.findByStripePaymentIntentId("pi_test_123"))
                .thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);

        paymentService.markPaymentFailed("pi_test_123");

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test
    void markPaymentFailed_unknownIntent_doesNothing() {
        when(paymentRepository.findByStripePaymentIntentId("pi_unknown"))
                .thenReturn(Optional.empty());

        paymentService.markPaymentFailed("pi_unknown");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    void toDto_mapsAllFields() {
        var dto = paymentService.toDto(payment);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getBookingId()).isEqualTo(300L);
        assertThat(dto.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(50));
        assertThat(dto.getCurrency()).isEqualTo("eur");
        assertThat(dto.getStatus()).isEqualTo(PaymentStatus.SUCCEEDED);
        assertThat(dto.getStripePaymentIntentId()).isEqualTo("pi_test_123");
    }
}
