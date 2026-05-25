package com.diploma.spp.service;

import com.diploma.spp.model.Payment;
import com.diploma.spp.model.PaymentEvent;
import com.diploma.spp.model.PaymentStatus;
import com.diploma.spp.repository.PaymentEventRepository;
import com.diploma.spp.repository.PaymentRepository;
import com.stripe.model.Event;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeWebhookServiceTest {

    @Mock
    private StripePaymentService paymentService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentEventRepository paymentEventRepository;

    @InjectMocks
    private StripeWebhookService webhookService;

    private Payment payment;

    @BeforeEach
    void setUp() {
        var booking = com.diploma.spp.model.Booking.builder()
                .id(1L)
                .status(com.diploma.spp.model.BookingStatus.PENDING_PAYMENT)
                .build();

        payment = Payment.builder()
                .id(1L)
                .booking(booking)
                .amount(BigDecimal.valueOf(50))
                .currency("eur")
                .status(PaymentStatus.PENDING)
                .stripePaymentIntentId("pi_test_123")
                .stripeClientSecret("secret")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void handleEvent_duplicateEventId_skipped() {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_duplicate");
        when(paymentEventRepository.existsByStripeEventId("evt_duplicate")).thenReturn(true);

        webhookService.handleEvent(event);

        verify(paymentService, never()).confirmPaymentSucceeded(any());
        verify(paymentService, never()).markPaymentFailed(any());
    }

    @Test
    void handleEvent_unknownType_noActionTaken() {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_unknown_1");
        when(event.getType()).thenReturn("customer.created");
        when(event.getDataObjectDeserializer()).thenReturn(
                mock(com.stripe.model.EventDataObjectDeserializer.class));
        when(paymentEventRepository.existsByStripeEventId("evt_unknown_1")).thenReturn(false);

        webhookService.handleEvent(event);

        verify(paymentService, never()).confirmPaymentSucceeded(any());
        verify(paymentService, never()).markPaymentFailed(any());
        verify(paymentEventRepository, never()).save(any());
    }

    @Test
    void handleEvent_idempotency_secondCallSkipped() {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_seen_before");

        // First call — not seen yet
        when(paymentEventRepository.existsByStripeEventId("evt_seen_before"))
                .thenReturn(false)
                .thenReturn(true);

        // Second call should be skipped
        when(event.getType()).thenReturn("customer.created");
        when(event.getDataObjectDeserializer()).thenReturn(
                mock(com.stripe.model.EventDataObjectDeserializer.class));

        webhookService.handleEvent(event);
        webhookService.handleEvent(event);

        // paymentService should never be called (unknown event type), but existsByStripeEventId
        // should be checked twice — second call returns true and bails out early
        verify(paymentEventRepository, times(2)).existsByStripeEventId("evt_seen_before");
        verify(paymentService, never()).confirmPaymentSucceeded(any());
    }
}
